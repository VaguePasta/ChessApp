import {CountSetBit} from "../bitboard/bit_operations";
import {Side} from "../bitboard/bit_boards";
import {GetRookAttacks} from "../pieces/rook";
import {MakeMove, MoveFlags, MoveList} from "./move";

export function GenerateRookMoves(rookBoard: bigint, occupancy: BigUint64Array, side: number, moveList: MoveList) {
    while (rookBoard) {
        let source = CountSetBit((rookBoard & -rookBoard) - 1n)
        let attackBoard = GetRookAttacks(source, occupancy[Side.both]) & ~occupancy[side]
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
        rookBoard = rookBoard & (rookBoard - 1n)
    }
}