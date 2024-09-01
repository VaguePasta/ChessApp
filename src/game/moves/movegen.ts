import {Game, GameInfo} from "../engine/game";
import {Pieces, Side} from "../bitboard/bit_boards";
import {GeneratePawnPushes} from "./pawn_pushes";
import {GeneratePawnCaptures} from "./pawn_attacks";
import {CastlingMoves} from "./castling";
import {GenerateKnightMoves} from "./knight_moves";
import {GenerateBishopMoves} from "./bishop_moves";
import {GenerateKingMoves} from "./king_moves";
import {GenerateRookMoves} from "./rook_moves";
import {MoveList, TryMoves} from "./move";
export function GenerateMoves(game: GameInfo): MoveList {
    let pieceBoard: bigint
    let side = game.SideToMove
    let PseudoLegalMoveList = {
        count: 0,
        moves: new Uint16Array(218)
    }
    let LegalMoveList = {
        count: 0,
        moves: new Uint16Array(218)
    }
    if (side == Side.white) {
        for (let piece = 0; piece <= 5; piece++) {
            pieceBoard = game.PieceBitboards[piece]
            if (piece === Pieces.P) {
                GeneratePawnPushes(pieceBoard, ~game.OccupancyBoards[Side.both], Side.white, PseudoLegalMoveList)
                GeneratePawnCaptures(pieceBoard, game.OccupancyBoards[Side.black], game.EnPassantSquare, Side.white, PseudoLegalMoveList)
            }
            if (piece === Pieces.K) {
                GenerateKingMoves(pieceBoard, game.OccupancyBoards[Side.white], game.OccupancyBoards[Side.black], PseudoLegalMoveList)
                CastlingMoves(game.CastlingRight, game.PieceBitboards, game.OccupancyBoards, Side.white, PseudoLegalMoveList)
            }
            if (piece === Pieces.N) {
                GenerateKnightMoves(pieceBoard, game.OccupancyBoards[Side.white], game.OccupancyBoards[Side.black], PseudoLegalMoveList)
            }
            if (piece === Pieces.B) {
                GenerateBishopMoves(pieceBoard, game.OccupancyBoards, Side.white, PseudoLegalMoveList)
            }
            if (piece === Pieces.R) {
                GenerateRookMoves(pieceBoard, game.OccupancyBoards, Side.white, PseudoLegalMoveList)
            }
            if (piece === Pieces.Q) {
                GenerateBishopMoves(pieceBoard, game.OccupancyBoards, Side.white, PseudoLegalMoveList)
                GenerateRookMoves(pieceBoard, game.OccupancyBoards, Side.white, PseudoLegalMoveList)
            }
        }
    }
    else {
        for (let piece = 6; piece <= 11; piece++) {
            pieceBoard = game.PieceBitboards[piece]
            if (piece == Pieces.p) {
                GeneratePawnPushes(pieceBoard, ~game.OccupancyBoards[Side.both], Side.black, PseudoLegalMoveList)
                GeneratePawnCaptures(pieceBoard, game.OccupancyBoards[Side.white], game.EnPassantSquare, Side.black, PseudoLegalMoveList)
            }
            if (piece === Pieces.k) {
                GenerateKingMoves(pieceBoard, game.OccupancyBoards[Side.black], game.OccupancyBoards[Side.white], PseudoLegalMoveList)
                CastlingMoves(game.CastlingRight, game.PieceBitboards, game.OccupancyBoards, Side.black, PseudoLegalMoveList)
            }
            if (piece === Pieces.n) {
                GenerateKnightMoves(pieceBoard, game.OccupancyBoards[Side.black], game.OccupancyBoards[Side.white], PseudoLegalMoveList)
            }
            if (piece === Pieces.b) {
                GenerateBishopMoves(pieceBoard, game.OccupancyBoards, Side.black, PseudoLegalMoveList)
            }
            if (piece === Pieces.r) {
                GenerateRookMoves(pieceBoard, game.OccupancyBoards, Side.black, PseudoLegalMoveList)
            }
            if (piece === Pieces.q) {
                GenerateBishopMoves(pieceBoard, game.OccupancyBoards, Side.black, PseudoLegalMoveList)
                GenerateRookMoves(pieceBoard, game.OccupancyBoards, Side.black, PseudoLegalMoveList)
            }
        }
    }
    TryMoves(game, PseudoLegalMoveList, LegalMoveList)
    return LegalMoveList
}