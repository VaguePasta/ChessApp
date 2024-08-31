import {ClearBit, GetBit, LeastSignificantOneIndex} from "../bitboard/bit_operations";
import {IndexToAlgebraic} from "../bitboard/conversions";
import {GetBishopAttacks} from "../pieces/bishop";
import {Side} from "../bitboard/bit_boards";
import {IncrementLegalMoves} from "./movegen";

export function GenerateBishopMoves(bishopBoard: bigint, occupancy: BigUint64Array, side: number) {
    while (bishopBoard) {
        let source = LeastSignificantOneIndex(bishopBoard)
        let attackBoard = GetBishopAttacks(source, occupancy[Side.both]) & ~occupancy[side]
        while (attackBoard) {
            let target = LeastSignificantOneIndex(attackBoard)
            if (!GetBit(occupancy[1 - side], target)) {
                console.log(IndexToAlgebraic(source) + IndexToAlgebraic(target))
                IncrementLegalMoves()
            }
            else {
                console.log(IndexToAlgebraic(source) + IndexToAlgebraic(target))
                IncrementLegalMoves()
            }
            attackBoard = ClearBit(attackBoard, target)
        }
        bishopBoard = ClearBit(bishopBoard, source)
    }
}