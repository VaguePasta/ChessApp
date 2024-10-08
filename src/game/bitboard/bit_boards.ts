export enum Side {
    white, black, both
}
/*
        0001: White kingside castling.
        0010: White queenside casting.
        0100: Black kingside castling.
        1000: Black queenside castling.
*/
export enum CastlingRights {
    WhiteKing = 1,
    WhiteQueen = 2,
    BlackKing = 4,
    BlackQueen = 8
}
export enum Pieces {P, N, B, R, Q, K, p, n, b, r, q, k}
export const PieceName = "PNBRQKpnbrqk"
export const PieceSymbols: string = "♟♞♝♜♛♚♙♘♗♖♕♔"
export function PieceOnGivenSquare(index: bigint, bitboards: BigUint64Array) {
    let bit_check = 1n << index
    for (let i = 0; i < 12; i++) {
        if (bitboards[i] & bit_check) return i
    }
}