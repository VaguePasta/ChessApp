import {GameState} from "../engine/game";
import {CountSetBit} from "../bitboard/bit_operations";
import {Pieces, Side} from "../bitboard/bit_boards";
import {GetRookAttacks} from "../pieces/rook";
import {GetBishopAttacks} from "../pieces/bishop";
import {LinesBetween} from "../bitboard/consts";
import {KnightAttackTables} from "../pieces/knight";
import {PawnAttackTables} from "../pieces/pawn";

export function UpdatePinnedPieces(game: GameState, pinnedSide: number): bigint {
    let kingIndex = CountSetBit((game.PieceBitboards[pinnedSide ? Pieces.k : Pieces.K] & -game.PieceBitboards[pinnedSide ? Pieces.k : Pieces.K]) - 1n)
    let attack_map = (GetRookAttacks(kingIndex, game.OccupancyBoards[1 - pinnedSide]) & (game.PieceBitboards[pinnedSide ? Pieces.R : Pieces.r] | game.PieceBitboards[pinnedSide ? Pieces.Q : Pieces.q]))
        | (GetBishopAttacks(kingIndex, game.OccupancyBoards[1 - pinnedSide]) & (game.PieceBitboards[pinnedSide ? Pieces.B : Pieces.b] | game.PieceBitboards[pinnedSide ? Pieces.Q : Pieces.q]))
    let pinned_map: bigint = 0n
    while (attack_map) {
        let sniper = CountSetBit((attack_map & -attack_map) - 1n)
        let intersection = LinesBetween[Number(sniper)][Number(kingIndex)] & game.OccupancyBoards[pinnedSide]
        if (CountSetBit(intersection) === 1n) {
            pinned_map |= intersection
        }
        attack_map = attack_map & (attack_map - 1n)
    }
    return pinned_map
}

export function CheckingPieces(pieceBitboards: BigUint64Array, occupancyBoards: BigUint64Array, kingIndex: number, sideToMove: number): bigint {
    return (KnightAttackTables[kingIndex] & pieceBitboards[!sideToMove ? Pieces.n : Pieces.N])
        | (PawnAttackTables[sideToMove][kingIndex] & pieceBitboards[!sideToMove ? Pieces.p : Pieces.P])
        | (GetRookAttacks(BigInt(kingIndex), occupancyBoards[Side.both]) & (pieceBitboards[!sideToMove ? Pieces.r : Pieces.R] | pieceBitboards[!sideToMove ? Pieces.q : Pieces.Q]))
        | (GetBishopAttacks(BigInt(kingIndex), occupancyBoards[Side.both]) & (pieceBitboards[!sideToMove ? Pieces.b : Pieces.B] | pieceBitboards[!sideToMove ? Pieces.q : Pieces.Q]))
}