import {ChessPiece} from "./ChessPiece.ts"

export function PopulateOccupiedBoards(pieces: Map<number, ChessPiece>): BigUint64Array {
    let bitboards = new BigUint64Array(2)
    pieces.forEach((piece,) => {
        if (((piece.PieceInfos[0] >> 3) & 0b00000011) === 0b1) { //White
            bitboards[0] = bitboards[0] ^ (1n << (BigInt(piece.PieceInfos[1]) & 0b00111111n))
        }
        else {
            bitboards[1] = bitboards[1] ^ (1n << (BigInt(piece.PieceInfos[1]) & 0b00111111n))
        }
    })
    return bitboards
}