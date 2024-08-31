import {ClearBit, GetBit, LeastSignificantOneIndex} from "../bitboard/bit_operations";
import {Side} from "../bitboard/bit_boards";
import {IndexToAlgebraic} from "../bitboard/conversions";
import {GetRookAttacks} from "../pieces/rook";
import {IncrementLegalMoves} from "./movegen";

export function GenerateRookMoves(rookBoard: bigint, occupancy: BigUint64Array, side: number) {
    while (rookBoard) {
        let source = LeastSignificantOneIndex(rookBoard)
        let attackBoard = GetRookAttacks(source, occupancy[Side.both]) & ~occupancy[side]
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
        rookBoard = ClearBit(rookBoard, source)
    }
}