import {Game} from "../game";
import {Pieces, Side} from "../bitboard/bit_boards";
import {GeneratePawnPushes} from "./pawn_pushes";
import {GeneratePawnCaptures} from "./pawn_attacks";
import {CastlingMoves} from "./castling";
import {GenerateKnightMoves} from "./knight_moves";
import {GenerateBishopMoves} from "./bishop_moves";
import {GenerateKingMoves} from "./king_moves";
import {GenerateRookMoves} from "./rook_moves";
import {ClearMoveList, PrintMove} from "./move";
export function GenerateMoves(game: Game, side: number) {
    let pieceBoard: bigint
    ClearMoveList(game.MoveList)
    if (side == Side.white) {
        for (let piece = 0; piece <= 5; piece++) {
            pieceBoard = game.PieceBitboards[piece]
            if (piece === Pieces.P) {
                GeneratePawnPushes(pieceBoard, ~game.OccupancyBoards[Side.both], Side.white, game.MoveList)
                GeneratePawnCaptures(pieceBoard, game.OccupancyBoards[Side.black], game.EnPassantSquare, Side.white, game.MoveList)
            }
            if (piece === Pieces.K) {
                GenerateKingMoves(pieceBoard, game.OccupancyBoards[Side.white], game.OccupancyBoards[Side.black], Side.white, game.MoveList)
                CastlingMoves(game.CastlingRight, game.PieceBitboards, game.OccupancyBoards, Side.white, game.MoveList)
            }
            if (piece === Pieces.N) {
                GenerateKnightMoves(pieceBoard, game.OccupancyBoards[Side.white], game.OccupancyBoards[Side.black], Side.white, game.MoveList)
            }
            if (piece === Pieces.B) {
                GenerateBishopMoves(pieceBoard, game.OccupancyBoards, Side.white, game.MoveList)
            }
            if (piece === Pieces.R) {
                GenerateRookMoves(pieceBoard, game.OccupancyBoards, Side.white, game.MoveList)
            }
            if (piece === Pieces.Q) {
                GenerateBishopMoves(pieceBoard, game.OccupancyBoards, Side.white, game.MoveList)
                GenerateRookMoves(pieceBoard, game.OccupancyBoards, Side.white, game.MoveList)
            }
        }
    }
    else {
        for (let piece = 6; piece <= 11; piece++) {
            pieceBoard = game.PieceBitboards[piece]
            if (piece == Pieces.p) {
                GeneratePawnPushes(pieceBoard, ~game.OccupancyBoards[Side.both], Side.black, game.MoveList)
                GeneratePawnCaptures(pieceBoard, game.OccupancyBoards[Side.white], game.EnPassantSquare, Side.black, game.MoveList)
            }
            if (piece === Pieces.k) {
                GenerateKingMoves(pieceBoard, game.OccupancyBoards[Side.black], game.OccupancyBoards[Side.white], Side.black, game.MoveList)
                CastlingMoves(game.CastlingRight, game.PieceBitboards, game.OccupancyBoards, Side.black, game.MoveList)
            }
            if (piece === Pieces.n) {
                GenerateKnightMoves(pieceBoard, game.OccupancyBoards[Side.black], game.OccupancyBoards[Side.white], Side.black, game.MoveList)
            }
            if (piece === Pieces.b) {
                GenerateBishopMoves(pieceBoard, game.OccupancyBoards, Side.black, game.MoveList)
            }
            if (piece === Pieces.r) {
                GenerateRookMoves(pieceBoard, game.OccupancyBoards, Side.black, game.MoveList)
            }
            if (piece === Pieces.q) {
                GenerateBishopMoves(pieceBoard, game.OccupancyBoards, Side.black, game.MoveList)
                GenerateRookMoves(pieceBoard, game.OccupancyBoards, Side.black, game.MoveList)
            }
        }
    }
    for (let i = 0; i < game.MoveList.count; i++) {
        PrintMove(game.MoveList.moves[i], side)
    }
    console.log("Total " + game.MoveList.count + " moves.")
}