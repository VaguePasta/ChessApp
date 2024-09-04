import {Game, GameState, NewGame} from "../game/engine/game";
import {ExecuteMove, MoveList} from "../game/moves/move";
import {GenerateMoves} from "../game/moves/movegen";
import {IsKingInCheck} from "../game/moves/attacks";
import {Player} from "./player";
import {CountSetBit} from "../game/bitboard/bit_operations";
import {Pieces, Side} from "../game/bitboard/bit_boards";

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
/*
    0: The game continues.
    1: The last side that moved won.
    2: Stalemate.
    3: Draw by 50-move rule.
    4: Draw by threefold repetition.
    5: Draw by insufficient material.
 */
function CheckEndGame(gameState: GameState, legalMoveList: MoveList) {
    if (legalMoveList.count === 0) {
        if (IsKingInCheck(gameState, 1 - gameState.SideToMove)) {
            return 1
        } else {
            return 2
        }
    }
    else if (gameState.HalfMoves >= 100) {
        return 3
    }
    let piecesLeft = CountSetBit(gameState.OccupancyBoards[Side.both])
    if (piecesLeft === 2n) {
        return 5
    }
    else if (piecesLeft === 3n) {
        if (CountSetBit(gameState.OccupancyBoards[Side.white]) === 1n) {
            if (gameState.PieceBitboards[Pieces.k] || gameState.PieceBitboards[Pieces.b]) {
                return 5
            }
        }
        else {
            if (gameState.PieceBitboards[Pieces.K] || gameState.PieceBitboards[Pieces.B]) {
                return 5
            }
        }
    }
    else if (piecesLeft === 4n && CountSetBit(gameState.OccupancyBoards[Side.white]) === 2n && CountSetBit(gameState.OccupancyBoards[Side.black]) === 2n) {
        if ((gameState.PieceBitboards[Pieces.k] || gameState.PieceBitboards[Pieces.b]) && (gameState.PieceBitboards[Pieces.K] || gameState.PieceBitboards[Pieces.B])) {
            return 5
        }
    }
    return 0
}
export function PlayMove(move: number, game: Game, player: Player) {
    game.GameState = ExecuteMove(game.GameState, move)
    game.LegalMoveList = GenerateMoves(game.GameState)
    switch (CheckEndGame(game.GameState, game.LegalMoveList)) {
        case 1:
            player.Connection.send("Won.")
            player.Connection.close()
            return
        case 2:
            player.Connection.send("Stalemate.")
            player.Connection.close()
            return
        case 3:
            player.Connection.send("Draw by fifty-move rule.")
            player.Connection.close()
            return
        case 5:
            player.Connection.send("Draw by insufficient material.")
            player.Connection.close()
            return
    }
    let responseMove = game.LegalMoveList.moves[Math.floor(Math.random() * game.LegalMoveList.count)]
    player.Connection.send(new Uint16Array([responseMove]).buffer)
    game.GameState = ExecuteMove(game.GameState, responseMove)
    game.LegalMoveList = GenerateMoves(game.GameState)
    switch (CheckEndGame(game.GameState, game.LegalMoveList)) {
        case 1:
            player.Connection.send("Lost.")
            player.Connection.close()
            return
        case 2:
            player.Connection.send("Stalemate.")
            player.Connection.close()
            return
        case 3:
            player.Connection.send("Draw by fifty-move rule.")
            player.Connection.close()
            return
        case 5:
            player.Connection.send("Draw by insufficient material.")
            player.Connection.close()
            return
    }
    player.Connection.send(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count))
}