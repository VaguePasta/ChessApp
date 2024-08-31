import {ClearBit, GetBit, LeastSignificantOneIndex} from "../bitboard/bit_operations";
import {KnightAttackTables} from "../pieces/knight";
import {IndexToAlgebraic} from "../bitboard/conversions";
import {AddMove, MakeMove, MoveFlags, MoveList} from "./move";
import {Pieces} from "../bitboard/bit_boards";

export function GenerateKnightMoves(knightBoard: bigint, allyOccupancy: bigint, opponentOccupancy: bigint, side: number, moveList: MoveList) {
    while (knightBoard) {
        let source = LeastSignificantOneIndex(knightBoard)
        let attackBoard = KnightAttackTables[Number(source)] & ~allyOccupancy
        while (attackBoard) {
            let target = LeastSignificantOneIndex(attackBoard)
            if (!GetBit(opponentOccupancy, target)) {
                AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.quiet_moves, side ? Pieces.n : Pieces.N))
            }
            else {
                AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.capture, side ? Pieces.n : Pieces.N))
            }
            attackBoard = ClearBit(attackBoard, target)
        }
        knightBoard = ClearBit(knightBoard, source)
    }
}