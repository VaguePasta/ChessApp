import {CountSetBit} from "../bitboard/bit_operations";
import {Side} from "../bitboard/bit_boards";
import {MakeMove, MoveFlags, MoveList} from "./move";

const rank5: bigint = 0x00000000FF000000n
const rank4: bigint = 0x000000FF00000000n
export function GeneratePawnPushes(pawnBoard: bigint, empty: bigint, side: number, moveList: MoveList) {
    if (side === Side.white) {
        let whiteSingle = (pawnBoard >> 8n) & 0xffffffffffffffn & empty
        let whiteDouble = (whiteSingle >> 8n) & 0xffffffffffffffn & empty & rank4
        while (whiteSingle) {
            let leastSingle = CountSetBit((whiteSingle & -whiteSingle) - 1n)
            if (leastSingle <= 7n) {
                moveList.moves[moveList.count++] = MakeMove(Number(leastSingle + 8n), Number(leastSingle), MoveFlags.knight_promotion)
                moveList.moves[moveList.count++] = MakeMove(Number(leastSingle + 8n), Number(leastSingle), MoveFlags.bishop_promotion)
                moveList.moves[moveList.count++] = MakeMove(Number(leastSingle + 8n), Number(leastSingle), MoveFlags.rook_promotion)
                moveList.moves[moveList.count++] = MakeMove(Number(leastSingle + 8n), Number(leastSingle), MoveFlags.queen_promotion)
            }
            else {
                moveList.moves[moveList.count++] = MakeMove(Number(leastSingle + 8n), Number(leastSingle), MoveFlags.quiet_moves)
            }
            whiteSingle = whiteSingle & (whiteSingle - 1n)
        }
        while (whiteDouble) {
            let leastDouble = CountSetBit((whiteDouble & -whiteDouble) - 1n)

            moveList.moves[moveList.count++] = MakeMove(Number(leastDouble + 16n), Number(leastDouble), MoveFlags.double_push)
            whiteDouble = whiteDouble & (whiteDouble - 1n)
        }
    }
    else {
        let blackSingle = (pawnBoard << 8n) & empty
        let blackDouble = (blackSingle << 8n) & empty & rank5
        while (blackSingle) {
            let leastSingle = CountSetBit((blackSingle & -blackSingle) - 1n)
            if (leastSingle >= 56n) {
                moveList.moves[moveList.count++] = MakeMove(Number(leastSingle - 8n), Number(leastSingle), MoveFlags.bishop_promotion)
                moveList.moves[moveList.count++] = MakeMove(Number(leastSingle - 8n), Number(leastSingle), MoveFlags.knight_promotion)
                moveList.moves[moveList.count++] = MakeMove(Number(leastSingle - 8n), Number(leastSingle), MoveFlags.rook_promotion)
                moveList.moves[moveList.count++] = MakeMove(Number(leastSingle - 8n), Number(leastSingle), MoveFlags.queen_promotion)
            }
            else {
                moveList.moves[moveList.count++] = MakeMove(Number(leastSingle - 8n), Number(leastSingle), MoveFlags.quiet_moves)
            }
            blackSingle = blackSingle & (blackSingle - 1n)
        }
        while (blackDouble) {
            let leastDouble = CountSetBit((blackDouble & -blackDouble) - 1n)
            moveList.moves[moveList.count++] = MakeMove(Number(leastDouble - 16n), Number(leastDouble), MoveFlags.double_push)
            blackDouble = blackDouble & (blackDouble - 1n)
        }
    }
}