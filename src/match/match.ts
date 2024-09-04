import {Game, NewGame} from "../game/engine/game";
import {ExecuteMove} from "../game/moves/move";
import {GenerateMoves} from "../game/moves/movegen";

export interface Match {
    Game: Game
    Token: string
    Connections: Array<WebSocket>
}
export const Matches: Map<string, Match> = new Map<string, Match>()
export function NewMatch(token: string, FEN: string, player1: any, player2 = undefined): boolean {
    let game = NewGame(FEN)
    if (game !== null) {
        Matches.set(token, {
            Game: game,
            Token: token,
            Connections: (player2 === undefined) ? [player1] : [player1, player2]
        })
        return true
    }
    else return false
}
export function PlayMove(move: number, game: Game, player: any) {
    game.GameInfo = ExecuteMove(game.GameInfo, move)
    game.LegalMoveList = GenerateMoves(game.GameInfo)
    if (game.LegalMoveList.count === 0) {
        player.send("Check.")
        return
    }
    let responseMove = game.LegalMoveList.moves[Math.floor(Math.random() * game.LegalMoveList.count)]
    player.send(new Uint16Array([responseMove]).buffer)
    game.GameInfo = ExecuteMove(game.GameInfo, responseMove)
    game.LegalMoveList = GenerateMoves(game.GameInfo)
    player.send(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count))
}