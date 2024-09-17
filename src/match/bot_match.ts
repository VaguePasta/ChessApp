import {GenerateRandomToken} from "../auth/token";
import {FENStart, Game} from "../game/engine/game";
import {Match, Matches, NewMatch, PlayMove} from "./match";
import {Active_sessions} from "../auth/account";
import {CustomWebSocket} from "../connection/websocket";
import {GenerateMoves} from "../game/moves/movegen";
import {ChildProcessWithoutNullStreams, spawn} from "node:child_process";
import {GenMoveString, MakeMove, MoveFlags, MoveList} from "../game/moves/move";
import {AlgebraicToIndex} from "../game/bitboard/conversions";
export function NewBotMatch(ws: any, sessionID: string, side: string, elo: number, personality: string): boolean {
    let user = Active_sessions.get(sessionID)
    if (!user) return false
    let token = GenerateRandomToken(8)
    if (!NewMatch(token, FENStart, {Side: parseInt(side), Connection: ws, Username: user.Username, Userid: user.Userid.toString()})) return false
    StartBotMatch(Matches.get(token), personality, elo)
    return true
}
export function StartBotMatch(match: Match | undefined, personality: string, elo: number) {
    if (!match) return
    let connection = match.Players[0].Connection
    // @ts-ignore
    const evaluator = spawn(process.env.STOCKFISH_DIRECTORY.toString(), {shell: false, windowsHide: true})
    // @ts-ignore
    const opponent = spawn(process.env.RODENT_DIRECTORY.toString(), {shell: false, windowsHide: true})
    evaluator.on('spawn', () => {
        evaluator.stdin.write("setoption name UCI_ShowWDL value true\n")
        evaluator.stdin.write("uci\n")
        evaluator.stdin.write("position startpos\n")
    })
    opponent.on('spawn', () => {
        opponent.stdin.write("uci\n")
        opponent.stdin.write("setoption name UCI_Elo value " + elo + "\n")
        opponent.stdin.write("setoption name Personality value " + personality + "\n")
        opponent.stdin.write("position startpos\n")
    })
    connection.send("ok")
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
        evaluator.stdin.write("quit\n")
        opponent.stdin.write("quit\n")
    })
    const positions = { position: "position startpos moves "}
    let responseFromEngine = ""
    connection.on('message', (data: any) => {
        if (data.toString() === "ok") {
            evaluator.stdout.on('data', (data: any) => {
                let evaluation = data.toString()
                if (evaluation.includes("info depth 13")) {
                    connection.emit('eval', ExtractWDL(evaluation))
                }
            })
            opponent.stdout.on('data', (data: any) => {
                let response = data.toString()
                if (response.includes("bestmove")) {
                    if (response.length >= 13) {
                        connection.emit('response', ExtractMove(response))
                    }
                    else responseFromEngine += response
                }
                else if (responseFromEngine) {
                    responseFromEngine += response
                    if (responseFromEngine.length >= 13) {
                        connection.emit('response', ExtractMove(responseFromEngine))
                        responseFromEngine = ""
                    }
                }
            })
            let game = match.Game
            if (!match.Players[0].Side) {
                evaluator.stdin.write("go depth 13\n")
                game.LegalMoveList = GenerateMoves(game.GameState)
                connection.send(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count))
            }
            else {
                evaluator.stdin.write("go depth 13\n")
                game.LegalMoveList = GenerateMoves(game.GameState)
                GetFirstMove(opponent)
            }
            connection.on('message', (data: any) => {
                if (game.GameState.SideToMove === match.Players[0].Side) {
                    if (ProcessMove(parseInt(data), game, positions, connection)) {
                        GetEvaluation(evaluator, positions)
                        GetResponse(opponent, positions)
                    }
                }
            })
            connection.on('response', (algebraic: string) => {
                let move = AlgebraicToMove(algebraic, game.LegalMoveList)
                let legalMoves = ProcessBotMove(move, game, connection)
                if (legalMoves) {
                    positions.position += algebraic + " "
                    setTimeout(() => {
                        SendResponse(connection, legalMoves)
                        GetEvaluation(evaluator, positions)
                    }, 1000)
                }
            })
            connection.on('eval', (evaluations: number[]) => {
                SendEvaluation(connection, evaluations)
            })
        }
    })
}
function GetFirstMove(opponent: ChildProcessWithoutNullStreams) {
    opponent.stdin.write("go depth 2\n")
}
function SendResponse(connection: any, legalMoveList: Uint16Array | number) {
    connection.send(legalMoveList)
}
function SendEvaluation(connection: any, evaluations: number[]) {
    let evals = new Uint16Array(4)
    evals.set(evaluations, 1)
    evals[0] = 0
    connection.send(evals)
}
function GetResponse(opponent: ChildProcessWithoutNullStreams, positions: {position: string}) {
    opponent.stdin.write(positions.position + "\n")
    opponent.stdin.write("go depth 2\n")
}
function GetEvaluation(evaluator: ChildProcessWithoutNullStreams, positions: {position: string}) {
    evaluator.stdin.write(positions.position + "\n")
    evaluator.stdin.write("go depth 13\n")
}
function ProcessMove(move: number, game: Game, positions: {position: string}, connection: any): number {
    switch (PlayMove(move, game)) {
        case 0:
            positions.position += GenMoveString(move) + " "
            return 1
        case 1:
            connection.send("You won.")
            connection.close()
            return 0
        case 2:
            connection.send("Stalemate.")
            connection.close()
            return 0
        case 3:
            connection.send("Draw by 50-move rule.")
            connection.close()
            return 0
        case 4:
            connection.send("Draw by threefold repetition.")
            connection.close()
            return 0
        case 5:
            connection.send("Draw by insufficient material.")
            connection.close()
            return 0
    }
}
function ProcessBotMove(move: number, game: Game, connection: any) {
    let legalMoves
    switch (PlayMove(move, game)) {
        case 0:
            game.LegalMoveList = GenerateMoves(game.GameState)
            legalMoves = new Uint16Array(game.LegalMoveList.count + 1)
            legalMoves.set(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count), 1)
            legalMoves[0] = move
            return legalMoves
        case 1:
            connection.send(new Uint16Array([move]))
            connection.send("You lost.")
            connection.close()
            return 0
        case 2:
            connection.send(new Uint16Array([move]))
            connection.send("Stalemate.")
            connection.close()
            return 0
        case 3:
            connection.send(new Uint16Array([move]))
            connection.send("Draw by 50-move rule.")
            connection.close()
            return 0
        case 4:
            connection.send(new Uint16Array([move]))
            connection.send("Draw by threefold repetition.")
            connection.close()
            return 0
        case 5:
            connection.send(new Uint16Array([move]))
            connection.send("Draw by insufficient material.")
            connection.close()
            return 0
    }
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
export function ExtractMove(response: string): string {
    let bestMoveIndex = response.lastIndexOf("bestmove")
    return response.slice(bestMoveIndex + 9, bestMoveIndex + 13)
}
function ExtractWDL(response: string): number[] {
    let wdl_index = response.indexOf("wdl", 45)
    let cutoff_index = response.indexOf("nodes", 55) - 1
    return response.slice(wdl_index + 4, cutoff_index).split(" ").map(Number)
}