import {IndexToAlgebraic} from "../bitboard/conversions";
import {PieceName, Pieces} from "../bitboard/bit_boards";

export const FromSquareMask = 0x3f
export const ToSquareMask = 0xfc0
export const MoveFlagsMask = 0xf000
export enum MoveFlags {
    quiet_moves, double_push, king_castle, queen_castle,
    capture, ep_capture,
    knight_promotion = 8, bishop_promotion,
    rook_promotion, queen_promotion, knight_promo_capture,
    bishop_promo_capture, rook_promo_capture, queen_promo_capture
}
/*
    A move is encoded using 2 bytes:
    0000 0000 0000 0000
    0000 0000 0011 1111 : From square
    0000 1111 1100 0000 : To square
    1111 0000 0000 0000 : Flags
    Flags:
    code 	promotion 	capture 	special 1 	special 0       kind of move
 _______________________________________________________________________________
      0 	    0 	        0 	        0 	        0           quiet moves
      1 	    0 	        0 	        0 	        1           double pawn push
      2 	    0 	        0 	        1 	        0           king castle
      3 	    0 	        0 	        1 	        1           queen castle
      4 	    0 	        1 	        0 	        0           captures
      5 	    0 	        1 	        0 	        1           ep-capture
      8 	    1 	        0 	        0 	        0           knight-promotion
      9 	    1 	        0 	        0       	1           bishop-promotion
     10 	    1 	        0 	        1       	0           rook-promotion
     11 	    1 	        0 	        1       	1           queen-promotion
     12 	    1 	        1 	        0       	0           knight-promo capture
     13 	    1 	        1 	        0       	1           bishop-promo capture
     14 	    1 	        1       	1       	0           rook-promo capture
     15 	    1 	        1       	1 	        1           queen-promo capture
 ________________________________________________________________________________

*/
export interface MoveList {
    moves: Uint16Array
    count: number
}
export function MakeMove(source: number, target: number, flag: number): number {
    return source | target << 6 | flag << 12
}
export function GetMoveSource(move: number): number {
    return move & FromSquareMask
}
export function GetMoveTarget(move: number): number {
    return (move & ToSquareMask) >>> 6
}
export function GetMoveFlag(move: number) {
    return (move & MoveFlagsMask) >>> 12
}
export function GivenSquarePiece(index: bigint, bitboards: BigUint64Array): number {
    let bit_check = 1n << index
    for (let i = 0; i < 12; i++) {
        if (bitboards[i] & bit_check) return i
    }
    return -1
}
export function MoveCapture(move: number): boolean {
    return ((move & MoveFlagsMask) >>> 12 & MoveFlags.capture & MoveFlags.ep_capture & MoveFlags.bishop_promo_capture &
        MoveFlags.knight_promo_capture & MoveFlags.queen_promo_capture & MoveFlags.rook_promo_capture) !== 0
}
export function MovePromotion(move: number, side: number = 1): number {
    let flag = (move & MoveFlagsMask) >>> 12
    if (flag === MoveFlags.bishop_promotion || flag === MoveFlags.bishop_promo_capture) {
        return side ? Pieces.b : Pieces.B
    }
    if (flag === MoveFlags.rook_promotion || flag === MoveFlags.rook_promo_capture) {
        return side ? Pieces.r : Pieces.R
    }
    if (flag === MoveFlags.knight_promotion || flag === MoveFlags.knight_promo_capture) {
        return side ? Pieces.n : Pieces.N
    }
    if (flag === MoveFlags.queen_promotion || flag === MoveFlags.queen_promo_capture) {
        return side ? Pieces.q : Pieces.Q
    }
    return 0
}
function IsCastling(move: number): number {
    let flag = (move & MoveFlagsMask) >>> 12
    if (flag === MoveFlags.king_castle) return 1
    else if (flag === MoveFlags.queen_castle) return -1
    return 0
}
export function GenMoveString(move: number) {
    let moveString: string = ""
    let promotion = MovePromotion(move)
    moveString += IndexToAlgebraic(BigInt(GetMoveSource(move)))
    moveString += IndexToAlgebraic(BigInt(GetMoveTarget(move)))
    if (promotion !== 0) moveString += PieceName.charAt(promotion)
    return moveString
}
export function PrintMove(move: number, side: number, pieceBoards: BigUint64Array) {
    let moveString: string = ""
    if (IsCastling(move) === 1) {
        moveString += "0-0"
    }
    else if (IsCastling(move) === -1) {
        moveString += "0-0-0"
    }
    else {
        let promotion = MovePromotion(move, side)
        moveString += PieceName.charAt(GivenSquarePiece(BigInt(move), pieceBoards))
        moveString += IndexToAlgebraic(BigInt(GetMoveSource(move)))
        if (MoveCapture(move)) moveString += "x"
        moveString += IndexToAlgebraic(BigInt(GetMoveTarget(move)))
        if (promotion !== 0) moveString += PieceName.charAt(promotion)
        if (((move & MoveFlagsMask) >>> 12) == 5) moveString += "e.p"
    }
    console.log(moveString)
}