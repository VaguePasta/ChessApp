import {ClearBit, GetBit, LeastSignificantOneIndex} from "../bitboard/bit_operations";
import {KnightAttackTables} from "../pieces/knight";
import {AddMove, MakeMove, MoveFlags, MoveList} from "./move";

export function GenerateKnightMoves(knightBoard: bigint, allyOccupancy: bigint, opponentOccupancy: bigint, moveList: MoveList) {
    while (knightBoard) {
        let source = LeastSignificantOneIndex(knightBoard)
        let attackBoard = KnightAttackTables[Number(source)] & ~allyOccupancy
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
        knightBoard = ClearBit(knightBoard, source)
    }
}