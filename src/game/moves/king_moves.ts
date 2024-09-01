import {ClearBit, GetBit, LeastSignificantOneIndex} from "../bitboard/bit_operations";
import {KingAttackTables} from "../pieces/king";
import {AddMove, MakeMove, MoveFlags, MoveList} from "./move";

export function GenerateKingMoves(kingBoard: bigint, allyOccupancy: bigint, opponentOccupancy: bigint, moveList: MoveList) {
    while (kingBoard) {
        let source = LeastSignificantOneIndex(kingBoard)
        let attackBoard = KingAttackTables[Number(source)] & ~allyOccupancy
        while (attackBoard) {
            let target = LeastSignificantOneIndex(attackBoard)
            if (!GetBit(opponentOccupancy, target)) {
                AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.quiet_moves))
            }
            else {
                AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.capture))
            }
            attackBoard = ClearBit(attackBoard, target)
        }
        kingBoard = ClearBit(kingBoard, source)
    }
}