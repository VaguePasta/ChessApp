import {CountSetBit} from "../bitboard/bit_operations";
import {KnightAttackTables} from "../pieces/knight";
import {MakeMove, MoveFlags, MoveList} from "./move";

export function GenerateKnightMoves(knightBoard: bigint, allyOccupancy: bigint, opponentOccupancy: bigint, moveList: MoveList) {
    while (knightBoard) {
        let source = CountSetBit((knightBoard & -knightBoard) - 1n)
        let attackBoard = KnightAttackTables[Number(source)] & ~allyOccupancy
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
        knightBoard = knightBoard & (knightBoard - 1n)
    }
}