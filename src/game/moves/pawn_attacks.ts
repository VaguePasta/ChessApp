import {ClearBit, LeastSignificantOneIndex, PrintBoard} from "../bitboard/bit_operations";
import {PawnAttackTables} from "../pieces/pawn";
import {AddMove, MakeMove, MoveFlags, MoveList, PrintMove} from "./move";
import {Pieces} from "../bitboard/bit_boards";
function EnPassant(enPassantSquare: number): bigint {
    if (enPassantSquare === -1) return 0n
    return 1n << BigInt(enPassantSquare)
}
export function GeneratePawnCaptures(pawnBoard: bigint, enemyOccupancy: bigint, enPassantSquare: number, side: number, moveList: MoveList) {
    while(pawnBoard) {
        let source = LeastSignificantOneIndex(pawnBoard)
        let target: bigint
        let attacks = PawnAttackTables[side][Number(source)] & (enemyOccupancy | EnPassant(enPassantSquare))
        while(attacks) {
            target = LeastSignificantOneIndex(attacks)
            if (target <= 7n || target >= 56n) {
                AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.rook_promo_capture, side ? Pieces.p : Pieces.P))
                AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.knight_promo_capture, side ? Pieces.p : Pieces.P))
                AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.bishop_promo_capture, side ? Pieces.p : Pieces.P))
                AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.queen_promo_capture, side ? Pieces.p : Pieces.P))
            }
            else {
                if (target === BigInt(enPassantSquare)) {
                    AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.ep_capture, side ? Pieces.p : Pieces.P))
                }
                else {
                    AddMove(moveList, MakeMove(Number(source), Number(target), MoveFlags.capture, side ? Pieces.p : Pieces.P))
                }
            }
            attacks = ClearBit(attacks, target)
        }
        pawnBoard = ClearBit(pawnBoard, source)
    }
}