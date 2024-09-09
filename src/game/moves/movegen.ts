import {GameState} from "../engine/game";
import {PieceOnGivenSquare, Pieces, Side} from "../bitboard/bit_boards";
import {GeneratePawnPushes} from "./pawn_pushes";
import {GeneratePawnCaptures} from "./pawn_attacks";
import {CastlingMoves} from "./castling";
import {GenerateKnightMoves} from "./knight_moves";
import {GenerateBishopMoves} from "./bishop_moves";
import {GenerateKingMoves} from "./king_moves";
import {GenerateRookMoves} from "./rook_moves";
import {GetMoveFlag, GetMoveSource, GetMoveTarget, GivenSquarePiece, MoveFlags, MoveList} from "./move";
import {IsKingInCheck, IsSquareAttacked} from "./attacks";
import {ExecuteMove} from "./execute_move";
import {CountSetBit} from "../bitboard/bit_operations";
import {LinesBetween, LinesIntersect} from "../bitboard/consts";
import {CheckingPieces} from "./updates";

export function TryMoves(game: GameState, pseudoLegalMoves: MoveList): MoveList {
    let LegalMoves = {
        count: 0,
        moves: new Uint16Array(218)
    }
    let movePiece
    let move, kingIndex = IsKingInCheck(game, 1 - game.SideToMove)
    let kingBoard = game.SideToMove ? Pieces.k : Pieces.K
    if (kingIndex !== -1) {
        let checkingBoard = CheckingPieces(game.PieceBitboards, game.OccupancyBoards, kingIndex, game.SideToMove)
        for (let i = 0; i < pseudoLegalMoves.count; i++) {
            move = pseudoLegalMoves.moves[i]
            movePiece = GivenSquarePiece(BigInt(GetMoveSource(move)), game.PieceBitboards, game.SideToMove)
            if (movePiece === kingBoard) {
                let gameCopy = ExecuteMove(game, move)
                if (IsKingInCheck(gameCopy, gameCopy.SideToMove) === -1) {
                    LegalMoves.moves[LegalMoves.count++] = move
                }
            }
        }
        switch (CountSetBit(checkingBoard)) {
            case 2n:
                break
            case 1n:
                let checker_position = CountSetBit((checkingBoard & -checkingBoard) - 1n)
                switch (PieceOnGivenSquare(checker_position, game.PieceBitboards)) {
                    case Pieces.p:
                    case Pieces.P:
                        for (let i = 0; i < pseudoLegalMoves.count; i++) {
                            move = pseudoLegalMoves.moves[i]
                            movePiece = GivenSquarePiece(BigInt(GetMoveSource(move)), game.PieceBitboards, game.SideToMove)
                            if (movePiece === kingBoard) continue
                            if (game.PinnedBoards[game.SideToMove] & (1n << BigInt(GetMoveSource(move)))) continue
                            let move_target = GetMoveTarget(move)
                            if (move_target === Number(checker_position)) {
                                LegalMoves.moves[LegalMoves.count++] = move
                            } else if (GetMoveFlag(move) === MoveFlags.ep_capture) {
                                if ((game.SideToMove ? move_target - 8 : move_target + 8) === Number(checker_position)) {
                                    LegalMoves.moves[LegalMoves.count++] = move
                                }
                            }
                        }
                        break
                    case Pieces.n:
                    case Pieces.N:
                        for (let i = 0; i < pseudoLegalMoves.count; i++) {
                            move = pseudoLegalMoves.moves[i]
                            movePiece = GivenSquarePiece(BigInt(GetMoveSource(move)), game.PieceBitboards, game.SideToMove)
                            if (movePiece === kingBoard) continue
                            if (game.PinnedBoards[game.SideToMove] & (1n << BigInt(GetMoveSource(move)))) continue
                            if (GetMoveTarget(move) === Number(checker_position)) {
                                LegalMoves.moves[LegalMoves.count++] = move
                            }
                        }
                        break
                    default:
                        for (let i = 0; i < pseudoLegalMoves.count; i++) {
                            move = pseudoLegalMoves.moves[i]
                            movePiece = GivenSquarePiece(BigInt(GetMoveSource(move)), game.PieceBitboards, game.SideToMove)
                            if (movePiece === kingBoard) continue
                            if (game.PinnedBoards[game.SideToMove] & (1n << BigInt(GetMoveSource(move)))) continue
                            let move_target = GetMoveTarget(move)
                            if (move_target === Number(checker_position)) {
                                LegalMoves.moves[LegalMoves.count++] = move
                            } else if (movePiece !== kingBoard && LinesBetween[kingIndex][Number(checker_position)] & (1n << BigInt(move_target))) {
                                LegalMoves.moves[LegalMoves.count++] = move
                            }
                        }
                }
        }
    } else for (let i = 0; i < pseudoLegalMoves.count; i++) {
        move = pseudoLegalMoves.moves[i]
        if (GetMoveFlag(move) === MoveFlags.ep_capture) {
            let gameCopy = ExecuteMove(game, move)
            if (IsKingInCheck(gameCopy, gameCopy.SideToMove) === -1) {
                LegalMoves.moves[LegalMoves.count++] = move
            }
            continue
        }
        movePiece = GivenSquarePiece(BigInt(GetMoveSource(move)), game.PieceBitboards, game.SideToMove)
        if (movePiece === kingBoard) {
            if (!IsSquareAttacked(game.PieceBitboards, game.OccupancyBoards, GetMoveTarget(move), 1 - game.SideToMove)) {
                LegalMoves.moves[LegalMoves.count++] = move
            }
            continue
        }
        let source = GetMoveSource(move)
        let target = GetMoveTarget(move)
        if (LinesIntersect[source][target] & game.PieceBitboards[game.SideToMove ? Pieces.k : Pieces.K]) {
            LegalMoves.moves[LegalMoves.count++] = move
            continue
        }
        if (!(game.PinnedBoards[game.SideToMove] & (1n << BigInt(source)))) {
            LegalMoves.moves[LegalMoves.count++] = move
        }
    }
    return LegalMoves
}

export function GenerateMoves(game: GameState): MoveList {
    let pieceBoard: bigint
    let side = game.SideToMove
    let PseudoLegalMoveList = {
        count: 0,
        moves: new Uint16Array(218)
    }
    switch(side) {
        case Side.white:
        for (let piece = 0; piece <= 5; piece++) {
            pieceBoard = game.PieceBitboards[piece]
            // if (pieceBoard)
            switch (piece) {
                case Pieces.K:
                    GenerateKingMoves(pieceBoard, game.OccupancyBoards[Side.white], game.OccupancyBoards[Side.black], PseudoLegalMoveList)
                    CastlingMoves(game.CastlingRight, game.PieceBitboards, game.OccupancyBoards, Side.white, PseudoLegalMoveList)
                    break
                case Pieces.P:
                    GeneratePawnPushes(pieceBoard, ~game.OccupancyBoards[Side.both], Side.white, PseudoLegalMoveList)
                    GeneratePawnCaptures(pieceBoard, game.OccupancyBoards[Side.black], game.EnPassantSquare, Side.white, PseudoLegalMoveList)
                    break
                case Pieces.N:
                    GenerateKnightMoves(pieceBoard, game.OccupancyBoards[Side.white], game.OccupancyBoards[Side.black], PseudoLegalMoveList)
                    break
                case Pieces.B:
                    GenerateBishopMoves(pieceBoard, game.OccupancyBoards, Side.white, PseudoLegalMoveList)
                    break
                case Pieces.R:
                    GenerateRookMoves(pieceBoard, game.OccupancyBoards, Side.white, PseudoLegalMoveList)
                    break
                case Pieces.Q:
                    GenerateBishopMoves(pieceBoard, game.OccupancyBoards, Side.white, PseudoLegalMoveList)
                    GenerateRookMoves(pieceBoard, game.OccupancyBoards, Side.white, PseudoLegalMoveList)
                    break
            }
        }
        break
        case Side.black:
            for (let piece = 6; piece <= 11; piece++) {
                pieceBoard = game.PieceBitboards[piece]
                // if (pieceBoard)
                switch(piece) {
                    case Pieces.p:
                        GeneratePawnPushes(pieceBoard, ~game.OccupancyBoards[Side.both], Side.black, PseudoLegalMoveList)
                        GeneratePawnCaptures(pieceBoard, game.OccupancyBoards[Side.white], game.EnPassantSquare, Side.black, PseudoLegalMoveList)
                        break
                    case Pieces.k:
                        GenerateKingMoves(pieceBoard, game.OccupancyBoards[Side.black], game.OccupancyBoards[Side.white], PseudoLegalMoveList)
                        CastlingMoves(game.CastlingRight, game.PieceBitboards, game.OccupancyBoards, Side.black, PseudoLegalMoveList)
                        break
                    case Pieces.n:
                        GenerateKnightMoves(pieceBoard, game.OccupancyBoards[Side.black], game.OccupancyBoards[Side.white], PseudoLegalMoveList)
                        break
                    case Pieces.b:
                        GenerateBishopMoves(pieceBoard, game.OccupancyBoards, Side.black, PseudoLegalMoveList)
                        break
                    case Pieces.r:
                        GenerateRookMoves(pieceBoard, game.OccupancyBoards, Side.black, PseudoLegalMoveList)
                        break
                    case Pieces.q:
                        GenerateBishopMoves(pieceBoard, game.OccupancyBoards, Side.black, PseudoLegalMoveList)
                        GenerateRookMoves(pieceBoard, game.OccupancyBoards, Side.black, PseudoLegalMoveList)
                        break
                }
        }
    }
    return TryMoves(game, PseudoLegalMoveList)
}