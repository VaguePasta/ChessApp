import {Game, NewGame} from "../game/engine/game";
import {ExecuteMove} from "../game/moves/move";
import {GenerateMoves} from "../game/moves/movegen";
import {IsKingInCheck} from "../game/moves/attacks";
import {Player} from "./player";

export interface Match {
    Game: Game
    Token: string
    Players: Array<Player>
}
export const Matches: Map<string, Match> = new Map<string, Match>()
export function NewMatch(token: string, FEN: string, player1: Player, player2: Player | undefined = undefined): boolean {
    let game = NewGame(FEN)
    if (game !== null) {
        Matches.set(token, {
            Game: game,
            Token: token,
            Players: (player2 === undefined) ? [player1] : [player1, player2]
        })
        return true
    }
    else return false
}
export function PlayMove(move: number, game: Game, player: Player) {
    game.GameState = ExecuteMove(game.GameState, move)
    game.LegalMoveList = GenerateMoves(game.GameState)
    if (game.LegalMoveList.count === 0) {
        if (IsKingInCheck(game.GameState, player.Side)) {
            player.Connection.send("Won.")
            player.Connection.close()
            return
        }
        else {
            player.Connection.send("Stalemate.")
            player.Connection.close()
            return
        }
    }
    else if (game.GameState.HalfMoves >= 100) {
        player.Connection.send("Draw by fifty-move rule.")
        player.Connection.close()
        return
    }
    let responseMove = game.LegalMoveList.moves[Math.floor(Math.random() * game.LegalMoveList.count)]
    player.Connection.send(new Uint16Array([responseMove]).buffer)
    game.GameState = ExecuteMove(game.GameState, responseMove)
    game.LegalMoveList = GenerateMoves(game.GameState)
    if (game.LegalMoveList.count === 0) {
        if (IsKingInCheck(game.GameState, 1 - player.Side)) {
            player.Connection.send("Lost.")
            player.Connection.close()
            return
        }
        else {
            player.Connection.send("Stalemate.")
            player.Connection.close()
            return
        }
    }
    else if (game.GameState.HalfMoves >= 100) {
        player.Connection.send("Draw by fifty-move rule.")
        player.Connection.close()
        return
    }
    player.Connection.send(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count))
}