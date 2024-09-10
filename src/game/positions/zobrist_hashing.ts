import {GameState} from "../engine/game";
import {MiscellaneousKey, PiecePositionKey} from "./init";
import {CountSetBit} from "../bitboard/bit_operations";
import {Side} from "../bitboard/bit_boards";
import {GivenSquarePiece} from "../moves/move";

// Return the Zobrist hash of the current game state.
export function HashFromState(game: GameState): bigint {
    let hash = game.SideToMove ? MiscellaneousKey[5] : MiscellaneousKey[4]
    if (game.CastlingRight & 0b0001) {
        hash = hash ^ MiscellaneousKey[0]
    }
    if (game.CastlingRight & 0b0010) {
        hash = hash ^ MiscellaneousKey[1]
    }
    if (game.CastlingRight & 0b0100) {
        hash = hash ^ MiscellaneousKey[2]
    }
    if (game.CastlingRight & 0b1000) {
        hash = hash ^ MiscellaneousKey[3]
    }
    if (!game.SideToMove) {
        hash = hash ^ MiscellaneousKey[4]
    }
    else {
        hash = hash ^ MiscellaneousKey[5]
    }
    let occupancy = game.OccupancyBoards[Side.both]
    while(occupancy) {
        let index = CountSetBit((occupancy & -occupancy) - 1n)
        let piece = GivenSquarePiece(index, game.PieceBitboards)
        hash = hash ^ PiecePositionKey[piece][Number(index)]
        occupancy = occupancy & (occupancy - 1n)
    }
    return hash
}