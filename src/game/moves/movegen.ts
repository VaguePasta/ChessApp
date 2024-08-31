import {Game} from "../game";
import {Pieces, Side} from "../bitboard/bit_boards";
import {GeneratePawnPushes} from "./pawn_pushes";
import {GeneratePawnCaptures} from "./pawn_attacks";
import {CastlingMoves} from "./castling";
import {GenerateKnightMoves} from "./knight_moves";
import {GenerateBishopMoves} from "./bishop_moves";
import {GenerateKingMoves} from "./king_moves";
import {GenerateRookMoves} from "./rook_moves";
export let LegalMoves = new Uint16Array([0])[0]
export function IncrementLegalMoves() {
    LegalMoves+=1
}
export function GenerateMoves(game: Game, side: number) {
    let pieceBoard: bigint
    LegalMoves = 0
    if (side == Side.white) {
        for (let piece = 0; piece <= 5; piece++) {
            pieceBoard = game.PieceBitboards[piece]
            if (piece === Pieces.P) {
                GeneratePawnPushes(pieceBoard, ~game.OccupancyBoards[Side.both], Side.white)
                GeneratePawnCaptures(pieceBoard, game.OccupancyBoards[Side.black], game.EnPassantSquare, Side.white)
            }
            if (piece === Pieces.K) {
                GenerateKingMoves(pieceBoard, game.OccupancyBoards[Side.white], game.OccupancyBoards[Side.black])
                CastlingMoves(game.CastlingRight, game.PieceBitboards, game.OccupancyBoards, Side.white)
            }
            if (piece === Pieces.N) {
                GenerateKnightMoves(pieceBoard, game.OccupancyBoards[Side.white], game.OccupancyBoards[Side.black])
            }
            if (piece === Pieces.B) {
                GenerateBishopMoves(pieceBoard, game.OccupancyBoards, Side.white)
            }
            if (piece === Pieces.R) {
                GenerateRookMoves(pieceBoard, game.OccupancyBoards, Side.white)
            }
            if (piece === Pieces.Q) {
                GenerateBishopMoves(pieceBoard, game.OccupancyBoards, Side.white)
                GenerateRookMoves(pieceBoard, game.OccupancyBoards, Side.white)
            }
        }
    }
    else {
        for (let piece = 6; piece <= 11; piece++) {
            pieceBoard = game.PieceBitboards[piece]
            if (piece == Pieces.p) {
                GeneratePawnPushes(pieceBoard, ~game.OccupancyBoards[Side.both], Side.black)
                GeneratePawnCaptures(pieceBoard, game.OccupancyBoards[Side.white], game.EnPassantSquare, Side.black)
            }
            if (piece === Pieces.k) {
                GenerateKingMoves(pieceBoard, game.OccupancyBoards[Side.black], game.OccupancyBoards[Side.white])
                CastlingMoves(game.CastlingRight, game.PieceBitboards, game.OccupancyBoards, Side.black)
            }
            if (piece === Pieces.n) {
                GenerateKnightMoves(pieceBoard, game.OccupancyBoards[Side.black], game.OccupancyBoards[Side.white])
            }
            if (piece === Pieces.b) {
                GenerateBishopMoves(pieceBoard, game.OccupancyBoards, Side.black)
            }
            if (piece === Pieces.r) {
                GenerateRookMoves(pieceBoard, game.OccupancyBoards, Side.black)
            }
            if (piece === Pieces.q) {
                GenerateBishopMoves(pieceBoard, game.OccupancyBoards, Side.black)
                GenerateRookMoves(pieceBoard, game.OccupancyBoards, Side.black)
            }
        }
    }
    console.log("Total " + LegalMoves + " moves.")
}