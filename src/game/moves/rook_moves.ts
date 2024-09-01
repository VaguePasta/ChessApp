import {ClearBit, GetBit, LeastSignificantOneIndex} from "../bitboard/bit_operations";
import {Side} from "../bitboard/bit_boards";
import {GetRookAttacks} from "../pieces/rook";
import {AddMove, MakeMove, MoveFlags, MoveList} from "./move";

export function GenerateRookMoves(rookBoard: bigint, occupancy: BigUint64Array, side: number, moveList: MoveList) {
    while (rookBoard) {
        let source = LeastSignificantOneIndex(rookBoard)
        let attackBoard = GetRookAttacks(source, occupancy[Side.both]) & ~occupancy[side]
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
        rookBoard = ClearBit(rookBoard, source)
    }
}