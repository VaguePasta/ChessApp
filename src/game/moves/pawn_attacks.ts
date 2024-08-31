import {ClearBit, LeastSignificantOneIndex, PrintBoard} from "../bitboard/bit_operations";
import {PawnAttackTables} from "../pieces/pawn";
import {IndexToAlgebraic} from "../bitboard/conversions";
import {IncrementLegalMoves} from "./movegen";
function EnPassant(enPassantSquare: number): bigint {
    if (enPassantSquare === -1) return 0n
    return 1n << BigInt(enPassantSquare)
}
export function GeneratePawnCaptures(pawnBoard: bigint, enemyOccupancy: bigint, enPassantSquare: number, side: number) {
    while(pawnBoard) {
        let source = LeastSignificantOneIndex(pawnBoard)
        let target: bigint
        let attacks = PawnAttackTables[side][Number(source)] & (enemyOccupancy | EnPassant(enPassantSquare))
        while(attacks) {
            target = LeastSignificantOneIndex(attacks)
            if (side) {
                if (target >= 56n) {
                    console.log(IndexToAlgebraic(source) + IndexToAlgebraic(target))
                    IncrementLegalMoves()
                }
                else {
                    console.log(IndexToAlgebraic(source) + IndexToAlgebraic(target))
                    IncrementLegalMoves()
                }
            }
            else {
                if (target <= 7n) {
                    console.log(IndexToAlgebraic(source) + IndexToAlgebraic(target))
                    IncrementLegalMoves()
                }
                else {
                    console.log(IndexToAlgebraic(source) + IndexToAlgebraic(target))
                    IncrementLegalMoves()
                }
            }
            attacks = ClearBit(attacks, target)
        }
        pawnBoard = ClearBit(pawnBoard, source)
    }
}