import {ClearBit, GetBit, LeastSignificantOneIndex} from "../bitboard/bit_operations";
import {KnightAttackTables} from "../pieces/knight";
import {IndexToAlgebraic} from "../bitboard/conversions";
import {KingAttackTables} from "../pieces/king";
import {IncrementLegalMoves} from "./movegen";

export function GenerateKingMoves(kingBoard: bigint, allyOccupancy: bigint, opponentOccupancy: bigint) {
    while (kingBoard) {
        let source = LeastSignificantOneIndex(kingBoard)
        let attackBoard = KingAttackTables[Number(source)] & ~allyOccupancy
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
        kingBoard = ClearBit(kingBoard, source)
    }
}