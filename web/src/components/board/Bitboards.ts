import {ChessPiece} from "./ChessPiece.ts"

export function PopulateOccupiedBoards(pieces: Map<number, ChessPiece>): BigUint64Array {
    let bitboards = new BigUint64Array(2)
    pieces.forEach((piece,) => {
        if (((piece.Piece[0] >> 3) & 1) === 0) { //White
            bitboards[0] = bitboards[0] ^ (1n << BigInt(piece.Piece[1]))
        }
        else {
            bitboards[1] = bitboards[1] ^ (1n << BigInt(piece.Piece[1]))
        }
    })
    return bitboards
}