import {GenerateRandomToken} from "../auth/token";
import {FENStart, Game} from "../game/engine/game";
import {Match, Matches, NewMatch, PlayMove} from "./match";
import {Active_sessions} from "../auth/account";
import {CustomWebSocket} from "../connection/websocket";
import {GenerateMoves} from "../game/moves/movegen";
import {ChildProcessWithoutNullStreams, spawn} from "node:child_process";
import {GenMoveString, MakeMove, MoveFlags, MoveList} from "../game/moves/move";
import {AlgebraicToIndex} from "../game/bitboard/conversions";
import {CompressMatch} from "./record";
import {DatabaseConn} from "../database/init";

export function NewBotMatch(ws: any, sessionID: string, side: string, elo: number, personality: string): boolean {
    let user = Active_sessions.get(sessionID)
    if (!user) return false
    else user.LastUsed = Date.now()
    let token = GenerateRandomToken(8)
    if (!NewMatch(token, FENStart, {Side: parseInt(side), Connection: ws, Username: user.Username, Userid: user.Userid.toString()})) return false
    StartBotMatch(Matches.get(token), personality, elo)
    return true
}

function ChooseDepth(elo: number): number {
    if (elo < 900) return 1
    else if (elo < 1000) return 2
    else if (elo < 1300) return 3
    else if (elo < 1600) return 4
    else if (elo < 1900) return 5
    else if (elo < 2200) return 6
    else if (elo < 2400) return 7
    else if (elo < 2600) return 8
    else return 9
}

export function StartBotMatch(match: Match | undefined, personality: string, elo: number) {
    if (!match) return
    let connection = match.Players[0].Connection
    // @ts-ignore
    const opponent = spawn(process.env.RODENT_DIRECTORY.toString(), {shell: false, windowsHide: true})
    const depth = ChooseDepth(elo)
    opponent.on('spawn', () => {
        opponent.stdin.write("uci\n")
        opponent.stdin.write("setoption name UCI_Elo value " + elo + "\n")
        opponent.stdin.write("setoption name Personality value " + personality + "\n")
        opponent.stdin.write("position startpos\n")
    })
    connection.send("ok" + personality)
    connection.send(btoa(FENStart + match.Players[0].Side))
    connection.removeAllListeners()
    connection.on('alive', (ws: CustomWebSocket) => {
        ws.isAlive = true
    })
    connection.on('pong', () => {
        connection.emit('alive', connection)
    })
    connection.on('close', () => {
        Matches.delete(match.Token)
        opponent.stdin.write("quit\n")
    })
    const positions = { position: "position startpos moves "}
    let responseFromEngine = ""
    connection.on('message', (data: any) => {
        if (data.toString() === "ok") {
            opponent.stdout.on('data', (data: any) => {
                let response = data.toString()
                if (response[response.length - 1] === "\n") {
                    if (responseFromEngine) {
                        responseFromEngine += response
                        if (responseFromEngine.startsWith("bestmove")) {
                            connection.emit('response', responseFromEngine.slice(9, 13).trimEnd())
                        }
                        responseFromEngine = ""
                    }
                    else if (response.startsWith("bestmove")) {
                        connection.emit('response', response.slice(9, 13).trimEnd())
                    }
                }
                else responseFromEngine += response
            })
            let game = match.Game
            if (match.Players[0].Side === game.GameState.SideToMove) {
                game.LegalMoveList = GenerateMoves(game.GameState)
                connection.send(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count))
            }
            else {
                game.LegalMoveList = GenerateMoves(game.GameState)
                GetFirstMove(opponent, depth)
            }
            connection.on('message', (data: any) => {
                if (game.GameState.SideToMove === match.Players[0].Side) {
                    if (data.toString() === "Resign") {
                        connection.send("Lost by resignation.")
                        SaveGame(match, 1 - match.Players[0].Side, 'resign')
                        connection.close()
                    }
                    else if (ProcessMove(parseInt(data), game, positions, connection, match)) {
                        GetResponse(opponent, depth, positions)
                    }
                }
            })
            connection.on('response', (algebraic: string) => {
                let move = AlgebraicToMove(algebraic, game.LegalMoveList)
                let legalMoves = ProcessBotMove(move, game, connection, match)
                if (legalMoves) {
                    positions.position += algebraic + " "
                    setTimeout(() => {
                        SendResponse(connection, legalMoves)
                    }, 1000)
                }
            })
        }
    })
}
function GetFirstMove(opponent: ChildProcessWithoutNullStreams, depth: number) {
    opponent.stdin.write("go depth " + depth + "\n")
}
function SendResponse(connection: any, legalMoveList: Uint16Array | number) {
    connection.send(legalMoveList)
}
function GetResponse(opponent: ChildProcessWithoutNullStreams, depth: number, positions: {position: string}) {
    opponent.stdin.write(positions.position + "\n")
    opponent.stdin.write("go depth " + depth + "\n")
}
function ProcessMove(move: number, game: Game, positions: {position: string}, connection: any, match: Match): number {
    match.Moves += BigInt(move) << BigInt(16 * match.MoveCount++)
    switch (PlayMove(move, game)) {
        case 0:
            positions.position += GenMoveString(move) + " "
            return 1
        case 1:
            SaveGame(match, match.Players[0].Side ? -1 : 1, 'check')
            connection.send("You won.")
            connection.close()
            return 0
        case 2:
            SaveGame(match, 0, 'stalemate')
            connection.send("Stalemate.")
            connection.close()
            return 0
        case 3:
            SaveGame(match, 0, '50')
            connection.send("Draw by 50-move rule.")
            connection.close()
            return 0
        case 4:
            SaveGame(match, 0, '3')
            connection.send("Draw by threefold repetition.")
            connection.close()
            return 0
        case 5:
            SaveGame(match, 0, 'mats')
            connection.send("Draw by insufficient material.")
            connection.close()
            return 0
    }
}
function ProcessBotMove(move: number, game: Game, connection: any, match: Match) {
    let legalMoves
    match.Moves += (BigInt(move) << BigInt(16 * match.MoveCount++))
    switch (PlayMove(move, game)) {
        case 0:
            game.LegalMoveList = GenerateMoves(game.GameState)
            legalMoves = new Uint16Array(game.LegalMoveList.count + 1)
            legalMoves.set(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count), 1)
            legalMoves[0] = move
            return legalMoves
        case 1:
            SaveGame(match, match.Players[0].Side ? 1 : -1, 'check')
            connection.send(new Uint16Array([move]))
            connection.send("You lost.")
            connection.close()
            return 0
        case 2:
            SaveGame(match, 0, 'stalemate')
            connection.send(new Uint16Array([move]))
            connection.send("Stalemate.")
            connection.close()
            return 0
        case 3:
            SaveGame(match, 0, '50')
            connection.send(new Uint16Array([move]))
            connection.send("Draw by 50-move rule.")
            connection.close()
            return 0
        case 4:
            SaveGame(match, 0, '3')
            connection.send(new Uint16Array([move]))
            connection.send("Draw by threefold repetition.")
            connection.close()

            return 0
        case 5:
            SaveGame(match, 0, 'mats')
            connection.send(new Uint16Array([move]))
            connection.send("Draw by insufficient material.")
            connection.close()
            return 0
    }
}
async function SaveGame(match: Match, winSide: number, matchResult: string) {
    let winner = winSide ? (winSide === 1 ? 'white' : 'black') : 'draw'
    if (!match.Players[0].Side)
        await DatabaseConn`insert into game_records(white_player, black_player, moves, date_added, win_side, result) values (${match.Players[0].Userid}, null, ${CompressMatch(match.Moves)}, localtimestamp(0), ${winner}, ${matchResult})`
    else
        await DatabaseConn`insert into game_records(white_player, black_player, moves, date_added, win_side, result) values (null, ${match.Players[0].Userid}, ${CompressMatch(match.Moves)}, localtimestamp(0), ${winner}, ${matchResult})`
}
function AlgebraicToMove(algebraic: string, legalMoveList: MoveList): number {
    let source = AlgebraicToIndex(algebraic.slice(0, 2))
    let target = AlgebraicToIndex(algebraic.slice(2, 4))
    if (algebraic.length === 5) {
        switch (algebraic[4]) {
            case 'q':
                if (source % 8 === target % 8)
                    return MakeMove(source, target, MoveFlags.queen_promotion)
                else return MakeMove(source, target, MoveFlags.queen_promo_capture)
            case 'r':
                if (source % 8 === target % 8)
                    return MakeMove(source, target, MoveFlags.rook_promotion)
                else return MakeMove(source, target, MoveFlags.rook_promo_capture)
            case 'b':
                if (source % 8 === target % 8)
                    return MakeMove(source, target, MoveFlags.bishop_promotion)
                else return MakeMove(source, target, MoveFlags.bishop_promo_capture)
            case 'n':
                if (source % 8 === target % 8)
                    return MakeMove(source, target, MoveFlags.knight_promotion)
                else return MakeMove(source, target, MoveFlags.knight_promo_capture)
        }
    }
    let move = MakeMove(source, target, MoveFlags.quiet_moves)
    return <number>legalMoveList.moves.find((element) => (element & 0xfff) === move)
}
