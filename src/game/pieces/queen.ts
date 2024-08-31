import {RightShift} from "../bitboard/bit_operations";
import {BishopAttackMask, BishopAttackTables, BishopRelevancyBitCounts} from "./bishop";
import {RookAttackMask, RookAttackTables, RookRelevancyBitCounts} from "./rook";
import {BishopMagicNumbers, RookMagicNumber} from "../magic_board/magic_numbers";

export function GetQueenAttacks(index: bigint, occupancy: bigint): bigint {
    let bishopOccupancy = occupancy
    let rookOccupancy = occupancy
    bishopOccupancy &= BishopAttackMask[Number(index)]
    bishopOccupancy *= BishopMagicNumbers[Number(index)]
    bishopOccupancy = RightShift(bishopOccupancy, BigInt(64 - BishopRelevancyBitCounts[Number(index)]))

    rookOccupancy &= RookAttackMask[Number(index)]
    rookOccupancy *= RookMagicNumber[Number(index)]
    rookOccupancy = RightShift(rookOccupancy, BigInt(64 - RookRelevancyBitCounts[Number(index)]))
    return  BishopAttackTables[Number(index)][Number(bishopOccupancy)]|RookAttackTables[Number(index)][Number(rookOccupancy)]
}