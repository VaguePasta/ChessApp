import {ClearBit, LeastSignificantOneIndex, RightShift} from "../bitboard/bit_operations";
import {IndexToAlgebraic} from "../bitboard/conversions";
import {Pieces, Side} from "../bitboard/bit_boards";
import {AddMove, MakeMove, MoveFlags, MoveList} from "./move";

export function GeneratePawnPushes(pawnBoard: bigint, empty: bigint, side: number, moveList: MoveList) {
    if (side === Side.white) {
        let whiteSingle = WhiteSinglePush(pawnBoard, empty)
        let whiteDouble = WhiteDoublePush(pawnBoard, empty)
        while (whiteSingle) {
            let leastSingle = LeastSignificantOneIndex(whiteSingle)
            if (leastSingle <= 7n) {
                AddMove(moveList, MakeMove(Number(leastSingle + 8n), Number(leastSingle), MoveFlags.knight_promotion, side ? Pieces.p : Pieces.P))
                AddMove(moveList, MakeMove(Number(leastSingle + 8n), Number(leastSingle), MoveFlags.bishop_promotion, side ? Pieces.p : Pieces.P))
                AddMove(moveList, MakeMove(Number(leastSingle + 8n), Number(leastSingle), MoveFlags.rook_promotion, side ? Pieces.p : Pieces.P))
                AddMove(moveList, MakeMove(Number(leastSingle + 8n), Number(leastSingle), MoveFlags.queen_promotion, side ? Pieces.p : Pieces.P))
            }
            else {
                AddMove(moveList, MakeMove(Number(leastSingle + 8n), Number(leastSingle), MoveFlags.quiet_moves, side ? Pieces.p : Pieces.P))
            }
            whiteSingle = ClearBit(whiteSingle, leastSingle)
        }
        while (whiteDouble) {
            let leastDouble = LeastSignificantOneIndex(whiteDouble)
            AddMove(moveList, MakeMove(Number(leastDouble + 16n), Number(leastDouble), MoveFlags.double_push, side ? Pieces.p : Pieces.P))
            whiteDouble = ClearBit(whiteDouble, leastDouble)
        }
    }
    else {
        let blackSingle = BlackSinglePush(pawnBoard, empty)
        let blackDouble = BlackDoublePush(pawnBoard, empty)
        while (blackSingle) {
            let leastSingle = LeastSignificantOneIndex(blackSingle)
            if (leastSingle >= 56n) {
                AddMove(moveList, MakeMove(Number(leastSingle - 8n), Number(leastSingle), MoveFlags.knight_promotion, side ? Pieces.p : Pieces.P))
                AddMove(moveList, MakeMove(Number(leastSingle - 8n), Number(leastSingle), MoveFlags.bishop_promotion, side ? Pieces.p : Pieces.P))
                AddMove(moveList, MakeMove(Number(leastSingle - 8n), Number(leastSingle), MoveFlags.rook_promotion, side ? Pieces.p : Pieces.P))
                AddMove(moveList, MakeMove(Number(leastSingle - 8n), Number(leastSingle), MoveFlags.queen_promotion, side ? Pieces.p : Pieces.P))
            }
            else {
                AddMove(moveList, MakeMove(Number(leastSingle - 8n), Number(leastSingle), MoveFlags.quiet_moves, side ? Pieces.p : Pieces.P))
            }
            blackSingle = ClearBit(blackSingle, leastSingle)
        }
        while (blackDouble) {
            let leastDouble = LeastSignificantOneIndex(blackDouble)
            AddMove(moveList, MakeMove(Number(leastDouble - 16n), Number(leastDouble), MoveFlags.double_push, side ? Pieces.p : Pieces.P))
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