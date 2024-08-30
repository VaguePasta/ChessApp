import {AlgebraicToIndex, PrintBoard, RightShift} from "../board";
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
    attackBoard |= RightShift(pieceBoard, 7n) & NotAFile
    attackBoard |= RightShift(pieceBoard, 8n)
    attackBoard |= RightShift(pieceBoard, 9n) & NotHFile
    attackBoard |= RightShift(pieceBoard, 1n) & NotHFile
    attackBoard |= (pieceBoard << 7n) & NotHFile
    attackBoard |= pieceBoard << 8n
    attackBoard |= (pieceBoard << 9n) & NotAFile
    attackBoard |= (pieceBoard << 1n) & NotAFile
    return attackBoard
}