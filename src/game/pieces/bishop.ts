import {CountSetBit, RightShift} from "../bitboard/bit_operations";
import {GenerateOccupancyBoard} from "../magic_board/occupancies";
import {BishopMagicNumbers} from "../magic_board/magic_numbers";

export const BishopRelevancyBitCounts: Uint8Array = new Uint8Array([
    6, 5, 5, 5, 5, 5, 5, 6,
    5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 7, 7, 7, 7, 5, 5,
    5, 5, 7, 9, 9, 7, 5, 5,
    5, 5, 7, 9, 9, 7, 5, 5,
    5, 5, 7, 7, 7, 7, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5,
    6, 5, 5, 5, 5, 5, 5, 6
])
export const BishopAttackMask: BigUint64Array = new BigUint64Array(64)
export const BishopAttackTables: Array<BigUint64Array> = Array.from(Array(64), () => new BigUint64Array(512))
export function GenerateBishopAttackTables() {
    for (let i = 0n; i < 64; i++) {
        BishopAttackMask[Number(i)] = MaskBishopAttacks(i)
        let relevantBitcounts = CountSetBit(BishopAttackMask[Number(i)])
        let occupancyIndices = (1n << relevantBitcounts)
        for (let index = 0n; index < occupancyIndices; index++) {
            let occupancy = GenerateOccupancyBoard(index, relevantBitcounts, BishopAttackMask[Number(i)])
            let magic_index = RightShift((occupancy * BishopMagicNumbers[Number(i)]), BigInt(64 - BishopRelevancyBitCounts[Number(i)]))
            BishopAttackTables[Number(i)][Number(magic_index)] = GenerateBishopAttacks(i, occupancy)
        }
    }
}
export function MaskBishopAttacks(index: bigint) {
    let attackBoard: bigint = 0n
    for (let rank = (index/8n) + 1n, file = (index % 8n) + 1n; rank <= 6n && file <= 6n; rank++, file++) {
        attackBoard |= (1n << (rank * 8n + file))
    }
    for (let rank = (index/8n) + 1n, file = (index % 8n) - 1n; rank <= 6n && file >= 1n; rank++, file--) {
        attackBoard |= (1n << (rank * 8n + file))
    }
    for (let rank = (index/8n) - 1n, file = (index % 8n) + 1n; rank >= 1n && file <= 6n; rank--, file++) {
        attackBoard |= (1n << (rank * 8n + file))
    }
    for (let rank = (index/8n) - 1n, file = (index % 8n) - 1n; rank >= 1n && file >= 1n; rank--, file--) {
        attackBoard |= (1n << (rank * 8n + file))
    }
    return attackBoard
}
export function GenerateBishopAttacks(index: bigint, blockTable: bigint) {
    let attackBoard: bigint = 0n
    for (let rank = (index/8n) + 1n, file = (index % 8n) + 1n; rank <= 7n && file <= 7n; rank++, file++) {
        attackBoard |= (1n << (rank * 8n + file))
        if ((1n << (rank * 8n + file)) & blockTable) break
    }
    for (let rank = (index/8n) + 1n, file = (index % 8n) - 1n; rank <= 7n && file >= 0n; rank++, file--) {
        attackBoard |= (1n << (rank * 8n + file))
        if ((1n << (rank * 8n + file)) & blockTable) break
    }
    for (let rank = (index/8n) - 1n, file = (index % 8n) + 1n; rank >= 0n && file <= 7n; rank--, file++) {
        attackBoard |= (1n << (rank * 8n + file))
        if ((1n << (rank * 8n + file)) & blockTable) break
    }
    for (let rank = (index/8n) - 1n, file = (index % 8n) - 1n; rank >= 0n && file >= 0n; rank--, file--) {
        attackBoard |= (1n << (rank * 8n + file))
        if ((1n << (rank * 8n + file)) & blockTable) break
    }
    return attackBoard
}
export function GetBishopAttacks(index: bigint, occupancy: bigint): bigint {
    occupancy &= BishopAttackMask[Number(index)]
    occupancy *= BishopMagicNumbers[Number(index)]
    occupancy = RightShift(occupancy, BigInt(64 - BishopRelevancyBitCounts[Number(index)]))
    return BishopAttackTables[Number(index)][Number(occupancy)]
}