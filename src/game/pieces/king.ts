import {NotAFile, NotHFile} from "./consts";

export const KingAttackTables: BigUint64Array = new BigUint64Array(64)
export function GenerateKingAttackTables() {
    for (let i = 0n; i < 64; i++) {
        KingAttackTables[Number(i)] = MaskKingAttacks(i)
    }
}
function MaskKingAttacks(index: bigint): bigint {
    let attackBoard: bigint = 0n
    let pieceBoard: bigint = 1n << index
    attackBoard |= (pieceBoard >> 7n) & ((1n << (64n - 7n)) - 1n) & NotAFile
    attackBoard |= (pieceBoard >> 8n) & ((1n << (64n - 8n)) - 1n)
    attackBoard |= (pieceBoard >> 9n) & ((1n << (64n - 9n)) - 1n) & NotHFile
    attackBoard |= (pieceBoard >> 1n) & ((1n << (64n - 1n)) - 1n) & NotHFile
    attackBoard |= (pieceBoard << 7n) & NotHFile
    attackBoard |= pieceBoard << 8n
    attackBoard |= (pieceBoard << 9n) & NotAFile
    attackBoard |= (pieceBoard << 1n) & NotAFile
    return attackBoard
}