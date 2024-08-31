import {ClearBit, GetBit, LeastSignificantOneIndex} from "../bitboard/bit_operations";
import {KnightAttackTables} from "../pieces/knight";
import {IndexToAlgebraic} from "../bitboard/conversions";
import {KingAttackTables} from "../pieces/king";
import {AddMove, MakeMove, MoveFlags, MoveList} from "./move";
import {Pieces} from "../bitboard/bit_boards";

export function GenerateKingMoves(kingBoard: bigint, allyOccupancy: bigint, opponentOccupancy: bigint, side: number, moveList: MoveList) {
    while (kingBoard) {
        let source = LeastSignificantOneIndex(kingBoard)
        let attackBoard = KingAttackTables[Number(source)] & ~allyOccupancy
        while (attackBoard) {
            let target = LeastSignificantOneIndex(attackBoard)
            if (!GetBit(opponentOccupancy, target)) {
                AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.quiet_moves, side ? Pieces.k : Pieces.K))
            }
            else {
                AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.capture, side ? Pieces.k : Pieces.K))
            }
            attackBoard = ClearBit(attackBoard, target)
        }
        kingBoard = ClearBit(kingBoard, source)
    }
}