import {CountSetBit} from "../bitboard/bit_operations";
import {KingAttackTables} from "../pieces/king";
import {MakeMove, MoveFlags, MoveList} from "./move";

export function GenerateKingMoves(kingBoard: bigint, allyOccupancy: bigint, opponentOccupancy: bigint, moveList: MoveList) {
    while (kingBoard) {
        let source = CountSetBit((kingBoard & -kingBoard) - 1n)
        let attackBoard = KingAttackTables[Number(source)] & ~allyOccupancy
        while (attackBoard) {
            let target = CountSetBit((attackBoard & -attackBoard) - 1n)
            if (!((opponentOccupancy >> target) & 1n)) {
                moveList.moves[moveList.count++] = MakeMove(Number(source), Number(target), MoveFlags.quiet_moves)
            }
            else {
                moveList.moves[moveList.count++] = MakeMove(Number(source), Number(target), MoveFlags.capture)
            }
            attackBoard = attackBoard & (attackBoard - 1n)
        }
        kingBoard = kingBoard & (kingBoard - 1n)
    }
}