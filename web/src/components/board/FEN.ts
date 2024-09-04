import type {ChessPiece} from "./ChessPiece";
import {PieceType} from "./ChessPiece";
export let FENStart = ""
export function SetFEN(FEN: string) {
    FENStart = FEN
}
export enum PieceCounter {
    blackPawn, whitePawn, blackKnight, whiteKnight, blackBishop, whiteBishop, blackRook, whiteRook, blackQueen, whiteQueen
}
export function ParseFEN(FEN: string): Map<number, ChessPiece> {
    let pieces = new Map<number, ChessPiece>();
    let counter = 0
    let pieceCount = 1
    /*
      A FEN string contains six fields:
      0: Pieces positions.
      1: Active color.
      2: Castling availability.
      3: En passant square.
      4: Half-move clock.
      5: Full-move clock.
    */
    const gameInformation = FEN.split(" ")

    for (let i = 0; i < gameInformation[0].length; i++) {
        let currentChar = gameInformation[0][i];
        if (currentChar >= '1' && currentChar <= '8') {
            counter += parseInt(currentChar)
        } else if (currentChar === 'p') {
            let pieceInfo: Uint8Array = new Uint8Array([pieceCount, PieceType.Pawn + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'P') {
            let pieceInfo = new Uint8Array([pieceCount, PieceType.Pawn, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'N') {
            let pieceInfo = new Uint8Array([pieceCount, PieceType.Knight, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'n') {
            let pieceInfo = new Uint8Array([pieceCount, PieceType.Knight + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'R') {
            let pieceInfo = new Uint8Array([pieceCount, PieceType.Rook, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'r') {
            let pieceInfo = new Uint8Array([pieceCount, PieceType.Rook + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'B') {
            let pieceInfo = new Uint8Array([pieceCount, PieceType.Bishop, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'b') {
            let pieceInfo = new Uint8Array([pieceCount, PieceType.Bishop + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'Q') {
            let pieceInfo = new Uint8Array([pieceCount, PieceType.Queen, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'q') {
            let pieceInfo = new Uint8Array([pieceCount, PieceType.Queen + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'K') {
            let pieceInfo = new Uint8Array([pieceCount, PieceType.King, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'k') {
            let pieceInfo = new Uint8Array([pieceCount, PieceType.King + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        }
    }
    return pieces
}