import {BishopAttackMask, BishopAttackTables, BishopRelevancyBitCounts} from "./bishop";
import {RookAttackMask, RookAttackTables, RookRelevancyBitCounts} from "./rook";
import {BishopMagicNumbers, RookMagicNumber} from "../magic_board/magic_numbers";

export function GetQueenAttacks(index: bigint, occupancy: bigint): bigint {
    let bishopOccupancy = occupancy
    let rookOccupancy = occupancy
    bishopOccupancy &= BishopAttackMask[Number(index)]
    bishopOccupancy *= BishopMagicNumbers[Number(index)]
    bishopOccupancy = (bishopOccupancy >> BigInt(64 - BishopRelevancyBitCounts[Number(index)])) & ((1n << (64n - BigInt(64 - BishopRelevancyBitCounts[Number(index)]))) - 1n)

    rookOccupancy &= RookAttackMask[Number(index)]
    rookOccupancy *= RookMagicNumber[Number(index)]
    rookOccupancy = (rookOccupancy >> BigInt(64 - RookRelevancyBitCounts[Number(index)])) & ((1n << (64n - BigInt(64 - RookRelevancyBitCounts[Number(index)]))) - 1n)
    return  BishopAttackTables[Number(index)][Number(bishopOccupancy)]|RookAttackTables[Number(index)][Number(rookOccupancy)]
}