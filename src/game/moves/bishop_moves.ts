import {ClearBit, GetBit, LeastSignificantOneIndex} from "../bitboard/bit_operations";
import {GetBishopAttacks} from "../pieces/bishop";
import {Side} from "../bitboard/bit_boards";
import {AddMove, MakeMove, MoveFlags, MoveList} from "./move";

export function GenerateBishopMoves(bishopBoard: bigint, occupancy: BigUint64Array, side: number, moveList: MoveList) {
    while (bishopBoard) {
        let source = LeastSignificantOneIndex(bishopBoard)
        let attackBoard = GetBishopAttacks(source, occupancy[Side.both]) & ~occupancy[side]
        while (attackBoard) {
            let target = LeastSignificantOneIndex(attackBoard)
            if (!GetBit(occupancy[1 - side], target)) {
                AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.quiet_moves))
            }
            else {
                AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.capture))
            }
            attackBoard = ClearBit(attackBoard, target)
        }
        bishopBoard = ClearBit(bishopBoard, source)
    }
}