import {ChessPiece} from "./ChessPiece.ts"

export function PopulateOccupiedBoards(pieces: Map<number, ChessPiece>): BigUint64Array {
    let bitboards = new BigUint64Array(2)
    bitboards[0] = BigInt(0)
    bitboards[1] = BigInt(0)
    pieces.forEach((piece,) => {
        if (((piece.PieceInfos[0] >> 3) & 0b00000011) === 0b00000001) { //White
            bitboards[0] = bitboards[0] ^ (BigInt(1) << (BigInt(piece.PieceInfos[1]) & BigInt(0b00111111)))
        }
        else {
            bitboards[1] = bitboards[1] ^ (BigInt(1) << (BigInt(piece.PieceInfos[1]) & BigInt(0b00111111)))
        }
    })
    return bitboards
}