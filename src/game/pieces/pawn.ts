import {NotAFile, NotHFile} from "./consts";

export const PawnAttackTables: Array<BigUint64Array> = Array.from(Array(2), () => new BigUint64Array(64))
export function GeneratePawnAttackTables() {
    for (let i = 0n; i < 64; i++) {
        PawnAttackTables[0][Number(i)] = MaskPawnAttack(0, i)
        PawnAttackTables[1][Number(i)] = MaskPawnAttack(1, i)
    }
}
function MaskPawnAttack(side: number, index: bigint): bigint {
    let attackBoard: bigint = 0n
    let pieceBoard: bigint = 1n << index
    if (!side) {
        attackBoard |= ((pieceBoard >> 7n) & 0x1ffffffffffffffn & NotAFile)
        attackBoard |= ((pieceBoard >> 9n) & 0x7fffffffffffffn & NotHFile)
    }
    else {
        attackBoard |= ((pieceBoard << 7n) & NotHFile)
        attackBoard |= ((pieceBoard << 9n) & NotAFile)
    }
    return attackBoard
}