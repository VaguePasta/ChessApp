import {CountSetBit, PrintBoard} from "../bitboard/bit_operations";
import {PawnAttackTables} from "../pieces/pawn";
import {MakeMove, MoveFlags, MoveList} from "./move";

function EnPassant(enPassantSquare: number): bigint {
    if (enPassantSquare === -1) return 0n
    return 1n << BigInt(enPassantSquare)
}
export function GeneratePawnCaptures(pawnBoard: bigint, enemyOccupancy: bigint, enPassantSquare: number, side: number, moveList: MoveList) {
    while(pawnBoard) {
        let source = CountSetBit((pawnBoard & -pawnBoard) - 1n)
        let target: bigint
        let attacks = PawnAttackTables[side][Number(source)] & (enemyOccupancy | EnPassant(enPassantSquare))
        while(attacks) {
            target = CountSetBit((attacks & -attacks) - 1n)
            if (target > 7n && target < 56n) {
                if (enPassantSquare !== -1 && target === BigInt(enPassantSquare)) {
                    moveList.moves[moveList.count++] = MakeMove(Number(source), Number(target), MoveFlags.ep_capture)
                }
                else {
                    moveList.moves[moveList.count++] = MakeMove(Number(source), Number(target), MoveFlags.capture)
                }
            }
            else {
                moveList.moves[moveList.count++] = MakeMove(Number(source), Number(target), MoveFlags.rook_promo_capture)
                moveList.moves[moveList.count++] = MakeMove(Number(source), Number(target), MoveFlags.knight_promo_capture)
                moveList.moves[moveList.count++] = MakeMove(Number(source), Number(target), MoveFlags.bishop_promo_capture)
                moveList.moves[moveList.count++] = MakeMove(Number(source), Number(target), MoveFlags.queen_promo_capture)
            }
            attacks = attacks & (attacks - 1n)
        }
        pawnBoard = pawnBoard & (pawnBoard - 1n)
    }
}