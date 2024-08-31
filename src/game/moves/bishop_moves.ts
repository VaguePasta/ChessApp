import {ClearBit, GetBit, LeastSignificantOneIndex} from "../bitboard/bit_operations";
import {IndexToAlgebraic} from "../bitboard/conversions";
import {GetBishopAttacks} from "../pieces/bishop";
import {Pieces, Side} from "../bitboard/bit_boards";
import {AddMove, MakeMove, MoveFlags, MoveList} from "./move";

export function GenerateBishopMoves(bishopBoard: bigint, occupancy: BigUint64Array, side: number, moveList: MoveList) {
    while (bishopBoard) {
        let source = LeastSignificantOneIndex(bishopBoard)
        let attackBoard = GetBishopAttacks(source, occupancy[Side.both]) & ~occupancy[side]
        while (attackBoard) {
            let target = LeastSignificantOneIndex(attackBoard)
            if (!GetBit(occupancy[1 - side], target)) {
                AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.quiet_moves, side ? Pieces.b : Pieces.B))
            }
            else {
                AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.capture, side ? Pieces.b : Pieces.B))
            }
            attackBoard = ClearBit(attackBoard, target)
        }
        bishopBoard = ClearBit(bishopBoard, source)
    }
}