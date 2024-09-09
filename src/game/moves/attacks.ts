import {CountSetBit} from "../bitboard/bit_operations";
import {Pieces, Side} from "../bitboard/bit_boards";
import {PawnAttackTables} from "../pieces/pawn";
import {GameState} from "../engine/game";
import {KnightAttackTables} from "../pieces/knight";
import {GetBishopAttacks} from "../pieces/bishop";
import {GetRookAttacks} from "../pieces/rook";
import {KingAttackTables} from "../pieces/king";

export function IsSquareAttacked(pieceBoards: BigUint64Array, occupancyBoards: BigUint64Array, index: number, attackedBy: number): boolean {
    if (attackedBy === Side.white) {
        if (GetBishopAttacks(BigInt(index), occupancyBoards[Side.both]) & (pieceBoards[Pieces.B] | pieceBoards[Pieces.Q])) return true
        if (GetRookAttacks(BigInt(index), occupancyBoards[Side.both]) & (pieceBoards[Pieces.R] | pieceBoards[Pieces.Q])) return true
        if (KnightAttackTables[index] & pieceBoards[Pieces.N]) return true
        if (PawnAttackTables[Side.black][index] & pieceBoards[Pieces.P]) return true
        if (KingAttackTables[index] & pieceBoards[Pieces.K]) return true
    }
    else {
        if (GetBishopAttacks(BigInt(index), occupancyBoards[Side.both]) & (pieceBoards[Pieces.b] | pieceBoards[Pieces.q])) return true
        if (GetRookAttacks(BigInt(index), occupancyBoards[Side.both]) & (pieceBoards[Pieces.r] | pieceBoards[Pieces.q])) return true
        if (KnightAttackTables[index] & pieceBoards[Pieces.n]) return true
        if (PawnAttackTables[Side.white][index] & pieceBoards[Pieces.p]) return true
        if (KingAttackTables[index] & pieceBoards[Pieces.k]) return true
    }
    return false
}
export function PrintAttackedSquare(game: GameState, side: number) {
    let board: string = ""
    board += "    a  b  c  d  e  f  g  h\n"
    for (let rank = 0; rank < 8; rank++) {
        board += (8 - rank) + "   "
        for (let file = 0; file < 8; file++) {
            board += (IsSquareAttacked(game.PieceBitboards, game.OccupancyBoards, rank * 8 + file,side) ? "1" : "0") + "  "
        }
        board += "\n"
    }
    console.log(board)
}
export function IsKingInCheck(game: GameState, checkedBy: number): number {
    let kingBoard = checkedBy ? game.PieceBitboards[Pieces.K] : game.PieceBitboards[Pieces.k]
    let kingIndex = Number(CountSetBit((kingBoard & -kingBoard) - 1n))
    if (IsSquareAttacked(game.PieceBitboards, game.OccupancyBoards, kingIndex, checkedBy)) {
        return kingIndex
    }
    return -1
}