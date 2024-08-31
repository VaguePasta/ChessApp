import {ClearBit, GetBit, LeastSignificantOneIndex} from "../bitboard/bit_operations";
import {KnightAttackTables} from "../pieces/knight";
import {IndexToAlgebraic} from "../bitboard/conversions";
import {IncrementLegalMoves} from "./movegen";

export function GenerateKnightMoves(knightBoard: bigint, allyOccupancy: bigint, opponentOccupancy: bigint) {
    while (knightBoard) {
        let source = LeastSignificantOneIndex(knightBoard)
        let attackBoard = KnightAttackTables[Number(source)] & ~allyOccupancy
        while (attackBoard) {
            let target = LeastSignificantOneIndex(attackBoard)
            if (!GetBit(opponentOccupancy, target)) {
                console.log(IndexToAlgebraic(source) + IndexToAlgebraic(target))
                IncrementLegalMoves()
            }
            else {
                console.log(IndexToAlgebraic(source) + IndexToAlgebraic(target))
                IncrementLegalMoves()
            }
            attackBoard = ClearBit(attackBoard, target)
        }
        knightBoard = ClearBit(knightBoard, source)
    }
}