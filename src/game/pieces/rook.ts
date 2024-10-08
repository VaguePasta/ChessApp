import {CountSetBit} from "../bitboard/bit_operations";
import {GenerateOccupancyBoard} from "../magic_board/occupancies";
import {RookMagicNumber} from "../magic_board/magic_numbers";

export const RookRelevancyBitCounts: Uint8Array = new Uint8Array([
    12, 11, 11, 11, 11, 11, 11, 12,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    12, 11, 11, 11, 11, 11, 11, 12
])
export const RookAttackMask: BigUint64Array = new BigUint64Array(64)
export const RookAttackTables: Array<BigUint64Array> = Array.from(Array(64), () => new BigUint64Array(4096))
export function GenerateRookAttackTables() {
    for (let i = 0n; i < 64n; i++) {
        RookAttackMask[Number(i)] = MaskRookAttacks(i)
        let relevantBitcounts = CountSetBit(RookAttackMask[Number(i)])
        let occupancyIndices = (1n << relevantBitcounts)
        for (let index = 0n; index < occupancyIndices; index++) {
            let occupancy = GenerateOccupancyBoard(index, relevantBitcounts, RookAttackMask[Number(i)])
            let magic_index = ((occupancy * RookMagicNumber[Number(i)]) >> BigInt(64 - RookRelevancyBitCounts[Number(i)])) & ((1n << (64n - BigInt(64 - RookRelevancyBitCounts[Number(i)]))) - 1n)
            RookAttackTables[Number(i)][Number(magic_index)] = GenerateRookAttacks(i, occupancy)
        }
    }
}
export function MaskRookAttacks(index: bigint): bigint {
    let attackBoard: bigint = 0n
    for (let rank = (index / 8n) + 1n; rank <= 6n; rank++) {
        attackBoard |= 1n << (rank * 8n + (index % 8n))
    }
    for (let rank = (index / 8n) - 1n; rank >= 1n; rank--) {
        attackBoard |= 1n << (rank * 8n + (index % 8n))
    }
    for (let file = (index % 8n) + 1n; file <= 6n; file++) {
        attackBoard |= 1n << ((index / 8n) * 8n + file)
    }
    for (let file = (index % 8n) - 1n; file >= 1n; file--) {
        attackBoard |= 1n << ((index / 8n) * 8n + file)
    }
    return attackBoard
}
export function GenerateRookAttacks(index: bigint, blockTable: bigint): bigint {
    let attackBoard: bigint = 0n
    for (let rank = (index / 8n) + 1n; rank <= 7n; rank++) {
        attackBoard |= 1n << (rank * 8n + (index % 8n))
        if ((1n << (rank * 8n + (index % 8n))) & blockTable) break
    }
    for (let rank = (index / 8n) - 1n; rank >= 0n; rank--) {
        attackBoard |= 1n << (rank * 8n + (index % 8n))
        if ((1n << (rank * 8n + (index % 8n))) & blockTable) break
    }
    for (let file = (index % 8n) + 1n; file <= 7n; file++) {
        attackBoard |= 1n << ((index / 8n) * 8n + file)
        if ((1n << ((index / 8n) * 8n + file)) & blockTable) break
    }
    for (let file = (index % 8n) - 1n; file >= 0n; file--) {
        attackBoard |= 1n << ((index / 8n) * 8n + file)
        if ((1n << ((index / 8n) * 8n + file)) & blockTable) break
    }
    return attackBoard
}
export function GetRookAttacks(index: bigint, occupancy: bigint): bigint {
    occupancy &= RookAttackMask[Number(index)]
    occupancy *= RookMagicNumber[Number(index)]
    occupancy = (occupancy >> BigInt(64 - RookRelevancyBitCounts[Number(index)])) & ((1n << (64n - BigInt(64 - RookRelevancyBitCounts[Number(index)]))) - 1n)
    return RookAttackTables[Number(index)][Number(occupancy)]
}