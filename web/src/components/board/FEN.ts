import type {ChessPiece} from "./ChessPiece";
import {PieceType} from "./ChessPiece";

export function ParseFEN(FEN: string): Map<number, ChessPiece> {
    let pieces = new Map<number, ChessPiece>();
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
    let counter: number = 0
    let blackPawn: number = 0
    let whitePawn: number = 0
    let blackKnight: number = 0
    let whiteKnight: number = 0
    let blackBishop: number = 0
    let whiteBishop: number = 0
    let blackRook: number = 0
    let whiteRook: number = 0
    let blackQueen: number = 0  //Technically will overflow when get to queen number 9 (Almost never).
    let whiteQueen: number = 0
    for (let i = 0; i < gameInformation[0].length; i++) {
        let currentChar = gameInformation[0][i];
        if (currentChar >= '1' && currentChar <= '8') {
            counter += parseInt(currentChar)
        } else if (currentChar === 'p') {
            let pieceInfo: Uint8Array = new Uint8Array([(blackPawn << 4) + PieceType.Pawn + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            blackPawn++
        } else if (currentChar === 'P') {
            let pieceInfo = new Uint8Array([(whitePawn << 4) + PieceType.Pawn, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            whitePawn++
        } else if (currentChar === 'N') {
            let pieceInfo = new Uint8Array([(whiteKnight << 4) + PieceType.Knight, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            whiteKnight++
        } else if (currentChar === 'n') {
            let pieceInfo = new Uint8Array([(blackKnight << 4) + PieceType.Knight + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            blackKnight++
        } else if (currentChar === 'R') {
            let pieceInfo = new Uint8Array([(whiteRook << 4) + PieceType.Rook, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            whiteRook++
        } else if (currentChar === 'r') {
            let pieceInfo = new Uint8Array([(blackRook << 4) + PieceType.Rook + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            blackRook++
        } else if (currentChar === 'B') {
            let pieceInfo = new Uint8Array([(whiteBishop << 4) + PieceType.Bishop, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            whiteBishop++
        } else if (currentChar === 'b') {
            let pieceInfo = new Uint8Array([(blackBishop << 4) + PieceType.Bishop + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            blackBishop++
        } else if (currentChar === 'Q') {
            let pieceInfo = new Uint8Array([(whiteQueen << 4) + PieceType.Queen, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            whiteQueen++
        } else if (currentChar === 'q') {
            let pieceInfo = new Uint8Array([(blackQueen << 4) + PieceType.Queen + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            blackQueen++
        } else if (currentChar === 'K') {
            let pieceInfo = new Uint8Array([PieceType.King, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
        } else if (currentChar === 'k') {
            let pieceInfo = new Uint8Array([PieceType.King + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
        }
    }
    return pieces
}