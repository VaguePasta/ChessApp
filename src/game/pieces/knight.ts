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
    attackBoard |= ((pieceBoard >> 17n) & 0x7fffffffffffn & NotHFile);
    attackBoard |= ((pieceBoard >> 15n) & 0x1ffffffffffffn & NotAFile);
    attackBoard |= ((pieceBoard >> 10n) & 0x3fffffffffffffn & NotGHFile);
    attackBoard |= ((pieceBoard >> 6n)  & 0x3ffffffffffffffn & NotABFile);
    attackBoard |= ((pieceBoard << 17n) & NotAFile);
    attackBoard |= ((pieceBoard << 15n) & NotHFile);
    attackBoard |= ((pieceBoard << 10n) & NotABFile);
    attackBoard |= ((pieceBoard << 6n)  & NotGHFile);
    return attackBoard
}