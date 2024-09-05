import {GameState} from "../engine/game";
import {MiscellaneousKey, PiecePositionKey} from "./init";
import {ClearBit, LeastSignificantOneIndex} from "../bitboard/bit_operations";
import {Side} from "../bitboard/bit_boards";
import {GivenSquarePiece} from "../moves/move";
// Return the Zobrist hash of the current game state.
export function HashFromState(game: GameState): bigint {
    let gameCopy = structuredClone(game)
    let hash = gameCopy.SideToMove ? MiscellaneousKey[5] : MiscellaneousKey[4]
    if (gameCopy.CastlingRight & 0b0001) {
        hash = hash ^ MiscellaneousKey[0]
    }
    if (gameCopy.CastlingRight & 0b0010) {
        hash = hash ^ MiscellaneousKey[1]
    }
    if (gameCopy.CastlingRight & 0b0100) {
        hash = hash ^ MiscellaneousKey[2]
    }
    if (gameCopy.CastlingRight & 0b1000) {
        hash = hash ^ MiscellaneousKey[3]
    }
    if (!gameCopy.SideToMove) {
        hash = hash ^ MiscellaneousKey[4]
    }
    else {
        hash = hash ^ MiscellaneousKey[5]
    }
    while(gameCopy.OccupancyBoards[Side.both]) {
        let index = LeastSignificantOneIndex(gameCopy.OccupancyBoards[Side.both])
        let piece = GivenSquarePiece(index, gameCopy.PieceBitboards, -1)
        hash = hash ^ PiecePositionKey[piece][Number(index)]
        gameCopy.OccupancyBoards[Side.both] = ClearBit(gameCopy.OccupancyBoards[Side.both], index)
    }
    return hash
}