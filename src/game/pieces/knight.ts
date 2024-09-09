import {NotABFile, NotAFile, NotGHFile, NotHFile} from "./consts";

export const KnightAttackTables: BigUint64Array = new BigUint64Array(64)
export function GenerateKnightAttackTables() {
    for (let i = 0n; i < 64; i++) {
        KnightAttackTables[Number(i)] = MaskKnightAttacks(i)
    }
}
function MaskKnightAttacks(index: bigint): bigint {
    let attackBoard: bigint = 0n
    let pieceBoard: bigint = 1n << index
    attackBoard |= ((pieceBoard >> 17n) & ((1n << (64n - 17n)) - 1n) & NotHFile);
    attackBoard |= ((pieceBoard >> 15n) & ((1n << (64n - 15n)) - 1n) & NotAFile);
    attackBoard |= ((pieceBoard >> 10n) & ((1n << (64n - 10n)) - 1n) & NotGHFile);
    attackBoard |= ((pieceBoard >> 6n) & ((1n << (64n - 6n)) - 1n) & NotABFile);
    attackBoard |= ((pieceBoard << 17n) & NotAFile);
    attackBoard |= ((pieceBoard << 15n) & NotHFile);
    attackBoard |= ((pieceBoard << 10n) & NotABFile);
    attackBoard |= ((pieceBoard << 6n) & NotGHFile);
    return attackBoard
}