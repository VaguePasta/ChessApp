import {CountSetBit} from "../bitboard/bit_operations";
import {GetBishopAttacks} from "../pieces/bishop";
import {Side} from "../bitboard/bit_boards";
import {MakeMove, MoveFlags, MoveList} from "./move";

export function GenerateBishopMoves(bishopBoard: bigint, occupancy: BigUint64Array, side: number, moveList: MoveList) {
    while (bishopBoard) {
        let source = CountSetBit((bishopBoard & -bishopBoard) - 1n)
        let attackBoard = GetBishopAttacks(source, occupancy[Side.both]) & ~occupancy[side]
        while (attackBoard) {
            let target = CountSetBit((attackBoard & -attackBoard) - 1n)
            if (!((occupancy[1 - side] >> target) & 1n)) {
                moveList.moves[moveList.count++] = MakeMove(Number(source), Number(target), MoveFlags.quiet_moves)
            }
            else {
                moveList.moves[moveList.count++] = MakeMove(Number(source), Number(target), MoveFlags.capture)
            }
            attackBoard = attackBoard & (attackBoard - 1n)
        }
        bishopBoard = bishopBoard & (bishopBoard - 1n)
    }
}