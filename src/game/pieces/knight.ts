import {NotABFile, NotAFile, NotGHFile, NotHFile} from "./consts";
import {AlgebraicToIndex, IndexToAlgebraic, PrintBoard, RightShift} from "../board";

export const KnightAttackTables: BigUint64Array = new BigUint64Array(64)
export function GenerateKnightAttackTables() {
    for (let i = 0n; i < 64; i++) {
        KnightAttackTables[Number(i)] = MaskKnightAttacks(i)
    }
}
function MaskKnightAttacks(index: bigint): bigint {
    let attackBoard: bigint = 0n
    let pieceBoard: bigint = 1n << index
    attackBoard |= (RightShift(pieceBoard, 17n) & NotHFile);
    attackBoard |= (RightShift(pieceBoard, 15n) & NotAFile);
    attackBoard |= (RightShift(pieceBoard, 10n) & NotGHFile);
    attackBoard |= (RightShift(pieceBoard, 6n) & NotABFile);
    attackBoard |= ((pieceBoard << 17n) & NotAFile);
    attackBoard |= ((pieceBoard << 15n) & NotHFile);
    attackBoard |= ((pieceBoard << 10n) & NotABFile);
    attackBoard |= ((pieceBoard << 6n) & NotGHFile);
    return attackBoard
}