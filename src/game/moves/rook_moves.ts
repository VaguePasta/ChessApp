import {ClearBit, GetBit, LeastSignificantOneIndex} from "../bitboard/bit_operations";
import {Pieces, Side} from "../bitboard/bit_boards";
import {IndexToAlgebraic} from "../bitboard/conversions";
import {GetRookAttacks} from "../pieces/rook";
import {AddMove, MakeMove, MoveFlags, MoveList} from "./move";

export function GenerateRookMoves(rookBoard: bigint, occupancy: BigUint64Array, side: number, moveList: MoveList) {
    while (rookBoard) {
        let source = LeastSignificantOneIndex(rookBoard)
        let attackBoard = GetRookAttacks(source, occupancy[Side.both]) & ~occupancy[side]
        while (attackBoard) {
            let target = LeastSignificantOneIndex(attackBoard)
            if (!GetBit(occupancy[1 - side], target)) {
                AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.quiet_moves, side ? Pieces.r : Pieces.R))
            }
            else {
                AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.capture, side ? Pieces.r : Pieces.R))
            }
            attackBoard = ClearBit(attackBoard, target)
        }
        rookBoard = ClearBit(rookBoard, source)
    }
}