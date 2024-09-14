import {GenerateRandomToken} from "../auth/token";
import {FENStart, Game} from "../game/engine/game";
import {Match, Matches, NewMatch, PlayMove} from "./match";
import {Active_sessions} from "../auth/account";
import {CustomWebSocket} from "../connection/websocket";
import {GenerateMoves} from "../game/moves/movegen";
import {ChildProcessWithoutNullStreams, spawn} from "node:child_process";
import {GenMoveString, MoveList} from "../game/moves/move";
export function NewBotMatch(ws: any, sessionID: string, side: string): boolean {
    let user = Active_sessions.get(sessionID)
    if (!user) return false
    let token = GenerateRandomToken(8)
    if (!NewMatch(token, FENStart, {Side: parseInt(side), Connection: ws, Username: user.Username, Userid: user.Userid.toString()})) return false
    StartBotMatch(Matches.get(token))
    return true
}
export function StartBotMatch(match: Match | undefined) {
    if (!match) return
    let connection = match.Players[0].Connection
    // @ts-ignore
    const stockfish = spawn(process.env.STOCKFISH_DIRECTORY.toString(), {shell: false, windowsHide: true})
    stockfish.on('spawn', () => {
        stockfish.stdin.write("setoption name UCI_ShowWDL value true\n")
        stockfish.stdin.write("uci\n")
        stockfish.stdin.write("position startpos\n")
    })
    connection.send("ok")
    connection.send(FENStart)
    connection.removeAllListeners()
    connection.on('alive', (ws: CustomWebSocket) => {
        ws.isAlive = true
    })
    connection.on('pong', () => {
        connection.emit('alive', connection)
    })
    connection.on('close', () => {
        Matches.delete(match.Token)
        stockfish.stdin.write("quit\n")
    })
    const positions = { position: "position startpos moves "}
    let bestmove: string = ""
    connection.on('message', (data: any) => {
        if (data.toString() === "ok") {
            let legalMoves: Uint16Array | undefined
            stockfish.stdout.on('data', (data) => {
                bestmove = data.toString()
                if (bestmove.includes("info depth 9")) {
                    if (game.GameState.SideToMove !== match.Players[0].Side) {
                        connection.emit('response', stockfish, bestmove, game, connection, positions)
                    } else {
                        connection.emit('bot-eval', legalMoves, connection, bestmove)
                    }
                }
            })
            let game = match.Game
            if (!match.Players[0].Side) {
                game.LegalMoveList = GenerateMoves(game.GameState)
                connection.send(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count))
            }
            else {
                game.LegalMoveList = GenerateMoves(game.GameState)
                let firstMove = game.LegalMoveList.moves[Math.floor(Math.random() * (game.LegalMoveList.count))]
                PlayMove(firstMove, game)
                game.LegalMoveList = GenerateMoves(game.GameState)
                legalMoves = new Uint16Array(game.LegalMoveList.count + 4)
                legalMoves.set(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count), 1)
                legalMoves[0] = firstMove
                positions.position += GenMoveString(firstMove) + " "
                stockfish.stdin.write(positions.position + "\n")
                stockfish.stdin.write("go depth 9\n")
            }
            connection.on('message', (data: any) => {
                if (game.GameState.SideToMove === match.Players[0].Side) {
                    ProcessMove(stockfish, parseInt(data), game, connection, positions)
                }
            })
            connection.on('response', (engine: ChildProcessWithoutNullStreams, bestmove: string, game: Game, connection: any, positions: {position: string}) => {
                legalMoves = GetPlayerEval(engine, bestmove, game, connection, positions)
            })
            connection.on('bot-eval', GetEvalAfterBotMove)
        }
    })
}
function GetPlayerEval(engine: ChildProcessWithoutNullStreams, bestmove: string, game: Game, connection: any, positions: {position: string}) {
    let evalmove = new Uint16Array(4)
    evalmove[0] = 0
    evalmove.set(ExtractWDL(bestmove), 1)
    connection.send(evalmove)
    return ProcessBotMove(engine, AlgebraicToMove(bestmove, game.LegalMoveList), game, connection, positions)
}
function ProcessMove(engine: ChildProcessWithoutNullStreams, move: number, game: Game, connection: any, positions: {position: string}) {
    switch (PlayMove(move, game)) {
        case 0:
            positions.position += GenMoveString(move) + " "
            engine.stdin.write(positions.position + "\n")
            engine.stdin.write("go depth 9\n")
            break
        case 1:
            connection.send("You won.")
            connection.close()
            return
        case 2:
            connection.send("Stalemate.")
            connection.close()
            return
        case 3:
            connection.send("Draw by 50-move rule.")
            connection.close()
            return
        case 4:
            connection.send("Draw by threefold repetition.")
            connection.close()
            return
        case 5:
            connection.send("Draw by insufficient material.")
            connection.close()
    }
}
function ProcessBotMove(engine: ChildProcessWithoutNullStreams, move: number, game: Game, connection: any, positions: {position: string}) {
    let response = game.LegalMoveList.moves[Math.floor(Math.random() * (game.LegalMoveList.count))]
    positions.position += GenMoveString(response) + " "
    let legalMoves
    switch (PlayMove(response, game)) {
        case 0:
            game.LegalMoveList = GenerateMoves(game.GameState)
            legalMoves = new Uint16Array(game.LegalMoveList.count + 4)
            legalMoves.set(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count), 1)
            legalMoves[0] = response
            engine.stdin.write(positions.position + "\n")
            engine.stdin.write("go depth 9\n")
            break
        case 1:
            connection.send(response)
            connection.send("You lost.")
            connection.close()
            break
        case 2:
            connection.send(response)
            connection.send("Stalemate.")
            connection.close()
            break
        case 3:
            connection.send(response)
            connection.send("Draw by 50-move rule.")
            connection.close()
            break
        case 4:
            connection.send(response)
            connection.send("Draw by threefold repetition.")
            connection.close()
            break
        case 5:
            connection.send(response)
            connection.send("Draw by insufficient material.")
            connection.close()
            break
    }
    return legalMoves
}
function GetEvalAfterBotMove(moves: Uint16Array, connection: any, bestmove: string) {
    let wdl = ExtractWDL(bestmove)
    moves[moves.length - 3] = wdl[0]
    moves[moves.length - 2] = wdl[1]
    moves[moves.length - 1] = wdl[2]
    setTimeout(() => {
        connection.send(moves)
    }, 1000)
}
function AlgebraicToMove(algebraic: string, legalMoveList: MoveList): number {
    return 0
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