import {FENStart, Game, NewGame, PrintGameState} from "../game/engine/game";
import {ExecuteMove, GetMoveFlag} from "../game/moves/move";
import {GenerateMoves} from "../game/moves/movegen";
import {PrintBoard} from "../game/bitboard/bit_operations";
import {Pieces} from "../game/bitboard/bit_boards";

export interface Match {
    Game: Game
    Token: string
    Connections: Array<WebSocket>
}
export const Matches: Map<string, Match> = new Map<string, Match>()
export function NewMatch(token: string, player1: any, player2 = undefined): boolean {
    let game = NewGame("8/3P4/K5b1/8/R7/5k2/8/8 w - - 0 1")
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
    PrintGameState(game.GameInfo)
}