import {ClearBit, LeastSignificantOneIndex, PrintBoard, RightShift} from "../bitboard/bit_operations";
import {IndexToAlgebraic} from "../bitboard/conversions";
import {Side} from "../bitboard/bit_boards";
import {IncrementLegalMoves} from "./movegen";

export function GeneratePawnPushes(pawnBoard: bigint, empty: bigint, side: number) {
    if (side === Side.white) {
        let whiteSingle = WhiteSinglePush(pawnBoard, empty)
        let whiteDouble = WhiteDoublePush(pawnBoard, empty)
        while (whiteSingle) {
            let leastSingle = LeastSignificantOneIndex(whiteSingle)
            if (leastSingle <= 7n) {
                console.log(IndexToAlgebraic(leastSingle + 8n) + IndexToAlgebraic(leastSingle))
                IncrementLegalMoves()
            }
            else {
                console.log(IndexToAlgebraic(leastSingle + 8n) + IndexToAlgebraic(leastSingle))
                IncrementLegalMoves()
            }
            whiteSingle = ClearBit(whiteSingle, leastSingle)
        }
        while (whiteDouble) {
            let leastDouble = LeastSignificantOneIndex(whiteDouble)
            console.log(IndexToAlgebraic(leastDouble + 16n) + IndexToAlgebraic(leastDouble))
            IncrementLegalMoves()
            whiteDouble = ClearBit(whiteDouble, leastDouble)
        }
    }
    else {
        let blackSingle = BlackSinglePush(pawnBoard, empty)
        let blackDouble = BlackDoublePush(pawnBoard, empty)
        while (blackSingle) {
            let leastSingle = LeastSignificantOneIndex(blackSingle)
            if (leastSingle >= 56n) {
                console.log(IndexToAlgebraic(leastSingle - 8n) + IndexToAlgebraic(leastSingle))
                IncrementLegalMoves()
            }
            else {
                console.log(IndexToAlgebraic(leastSingle - 8n) + IndexToAlgebraic(leastSingle))
                IncrementLegalMoves()
            }
            blackSingle = ClearBit(blackSingle, leastSingle)
        }
        while (blackDouble) {
            let leastDouble = LeastSignificantOneIndex(blackDouble)
            console.log(IndexToAlgebraic(leastDouble - 16n) + IndexToAlgebraic(leastDouble))
            IncrementLegalMoves()
            blackDouble = ClearBit(blackDouble, leastDouble)
        }
    }
}
function WhiteSinglePush(whitePawnBoard: bigint, empty: bigint): bigint {
    return RightShift(whitePawnBoard, 8n) & empty
}
function WhiteDoublePush(whitePawnBoard: bigint, empty: bigint) {
    const rank4: bigint = 0x000000FF00000000n
    let SinglePushes = RightShift(whitePawnBoard, 8n) & empty
    return RightShift(SinglePushes, 8n) & empty & rank4
}
function BlackSinglePush(blackPawnBoard: bigint, empty: bigint): bigint {
    return (blackPawnBoard << 8n) & empty
}
function BlackDoublePush(blackPawnBoard: bigint, empty: bigint) {
    const rank5: bigint = 0x00000000FF000000n
    let SinglePushes = (blackPawnBoard << 8n) & empty
    return (SinglePushes << 8n) & empty & rank5
}