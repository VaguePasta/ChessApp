import {RightShift} from "../board";
import {NotAFile, NotHFile} from "./consts";

export const PawnAttackTable: Array<BigUint64Array> = Array.from(Array(2), () => new BigUint64Array(64))
export function GeneratePawnAttackTables() {
    for (let i = 0n; i < 64; i++) {
        PawnAttackTable[0][Number(i)] = MaskPawnAttack(0, i)
        PawnAttackTable[1][Number(i)] = MaskPawnAttack(1, i)
    }
}
function MaskPawnAttack(side: number, index: bigint): bigint {
    let attackBoard: bigint = 0n
    let pieceBoard: bigint = 1n << index
    if (!side) {
        attackBoard |= (RightShift(pieceBoard, 7n) & NotAFile)
        attackBoard |= (RightShift(pieceBoard, 9n) & NotHFile)
    }
    else {
        attackBoard |= ((pieceBoard << 7n) & NotAFile)
        attackBoard |= ((pieceBoard << 9n) & NotHFile)
    }
    return attackBoard
}