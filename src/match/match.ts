import {Game, GameState, NewGame, PrintGameState} from "../game/engine/game";
import {MoveList} from "../game/moves/move";
import {IsKingInCheck} from "../game/moves/attacks";
import {CountSetBit} from "../game/bitboard/bit_operations";
import {Pieces, Side} from "../game/bitboard/bit_boards";
import {Player} from "./player";
import {ExecuteMove} from "../game/moves/execute_move";
import {GenerateMoves} from "../game/moves/movegen";

export interface Match {
    Game: Game
    Moves: bigint
    Token: string
    MoveCount: number
    Players: Array<Player>
}

export const Matches: Map<string, Match> = new Map<string, Match>()

export function NewMatch(token: string, FEN: string, player1: Player, player2: Player | undefined = undefined): boolean {
    let game = NewGame(FEN)
    if (game !== null) {
        Matches.set(token, {
            Game: game,
            Token: token,
            MoveCount: 0,
            Moves: 0n,
            Players: (player2 === undefined) ? [player1] : [player1, player2]
        })
        return true
    } else return false
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
        if (IsKingInCheck(gameState, 1 - gameState.SideToMove) !== -1) {
            return 1
        } else {
            return 2
        }
    } else if (gameState.HalfMoves >= 100) {
        return 3
    }
    let piecesLeft = CountSetBit(gameState.OccupancyBoards[Side.both])
    if (piecesLeft === 2n) {
        return 5
    } else if (piecesLeft === 3n) {
        if (CountSetBit(gameState.OccupancyBoards[Side.white]) === 1n) {
            if (gameState.PieceBitboards[Pieces.n] || gameState.PieceBitboards[Pieces.b]) {
                return 5
            }
        } else {
            if (gameState.PieceBitboards[Pieces.N] || gameState.PieceBitboards[Pieces.B]) {
                return 5
            }
        }
    } else if (piecesLeft === 4n && CountSetBit(gameState.OccupancyBoards[Side.white]) === 2n && CountSetBit(gameState.OccupancyBoards[Side.black]) === 2n) {
        if ((gameState.PieceBitboards[Pieces.k] || gameState.PieceBitboards[Pieces.b]) && (gameState.PieceBitboards[Pieces.K] || gameState.PieceBitboards[Pieces.B])) {
            return 5
        }
    }
    if (gameState.PastPositions.length >= 9) {
        let counter = 1
        for (let i = 0; i < gameState.PastPositions.length; i += 4) {
            if (gameState.PastPositions[0] !== gameState.PastPositions[i]) break
            else counter++
        }
        if (counter >= 3) return 4
    }
    return 0
}

export function PlayMove(move: number, game: Game) {
    game.GameState = ExecuteMove(game.GameState, move)
    game.LegalMoveList = GenerateMoves(game.GameState)
    return CheckEndGame(game.GameState, game.LegalMoveList)
}