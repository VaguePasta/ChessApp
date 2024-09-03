import type {ChessPiece} from "./ChessPiece";
import {PieceType} from "./ChessPiece";
export enum PieceCounter {
    blackPawn, whitePawn, blackKnight, whiteKnight, blackBishop, whiteBishop, blackRook, whiteRook, blackQueen, whiteQueen
}
export let pieceCounters = [0, 1, 0, 0, 0, 0, 0, 0, 0, 0]
export function ParseFEN(FEN: string): Map<number, ChessPiece> {
    let pieces = new Map<number, ChessPiece>();
    let counter = 0
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
            let pieceInfo: Uint8Array = new Uint8Array([(pieceCounters[PieceCounter.blackPawn] << 4) + PieceType.Pawn + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCounters[PieceCounter.blackPawn]++
        } else if (currentChar === 'P') {
            let pieceInfo = new Uint8Array([(pieceCounters[PieceCounter.whitePawn] << 4) + PieceType.Pawn, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCounters[PieceCounter.whitePawn]++
        } else if (currentChar === 'N') {
            let pieceInfo = new Uint8Array([(pieceCounters[PieceCounter.whiteKnight] << 4) + PieceType.Knight, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCounters[PieceCounter.whiteKnight]++
        } else if (currentChar === 'n') {
            let pieceInfo = new Uint8Array([(pieceCounters[PieceCounter.blackKnight] << 4) + PieceType.Knight + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCounters[PieceCounter.blackKnight]++
        } else if (currentChar === 'R') {
            let pieceInfo = new Uint8Array([(pieceCounters[PieceCounter.whiteRook] << 4) + PieceType.Rook, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCounters[PieceCounter.whiteRook]++
        } else if (currentChar === 'r') {
            let pieceInfo = new Uint8Array([(pieceCounters[PieceCounter.blackRook] << 4) + PieceType.Rook + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCounters[PieceCounter.blackRook]++
        } else if (currentChar === 'B') {
            let pieceInfo = new Uint8Array([(pieceCounters[PieceCounter.whiteBishop] << 4) + PieceType.Bishop, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCounters[PieceCounter.whiteBishop]++
        } else if (currentChar === 'b') {
            let pieceInfo = new Uint8Array([(pieceCounters[PieceCounter.blackBishop] << 4) + PieceType.Bishop + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCounters[PieceCounter.blackBishop]++
        } else if (currentChar === 'Q') {
            let pieceInfo = new Uint8Array([(pieceCounters[PieceCounter.whiteQueen] << 4) + PieceType.Queen, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCounters[PieceCounter.whiteQueen]++
        } else if (currentChar === 'q') {
            let pieceInfo = new Uint8Array([(pieceCounters[PieceCounter.blackQueen] << 4) + PieceType.Queen + 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCounters[PieceCounter.blackQueen]++
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