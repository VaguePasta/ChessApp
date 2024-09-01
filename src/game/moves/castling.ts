import {CastlingRights, Side} from "../bitboard/bit_boards";
import {KingsideBlack, KingsideWhite, QueensideBlack, QueensideWhite} from "../pieces/consts";
import {IsSquareAttacked} from "./attacks";
import {AddMove, MakeMove, MoveFlags, MoveList} from "./move";

export function CastlingMoves(castlingRights: number, pieceBoards: BigUint64Array, occupancy: BigUint64Array, side: number, moveList: MoveList) {
    if (!side) {
        if (IsSquareAttacked(pieceBoards, occupancy, 60, Side.black)) return
        if (castlingRights & CastlingRights.WhiteKing) {
            if (!(occupancy[Side.both] & KingsideWhite)) {
                if (!IsSquareAttacked(pieceBoards, occupancy, 61, Side.black) &&
                        !IsSquareAttacked(pieceBoards, occupancy, 62, Side.black)) {
                    AddMove(moveList, MakeMove(60, 62, MoveFlags.king_castle))
                }
            }
        }
        if (castlingRights & CastlingRights.WhiteQueen) {
            if (!(occupancy[Side.both] & QueensideWhite)) {
                if (!IsSquareAttacked(pieceBoards, occupancy, 57, Side.black) &&
                        !IsSquareAttacked(pieceBoards, occupancy, 58, Side.black) &&
                            !IsSquareAttacked(pieceBoards, occupancy, 59, Side.black)) {
                    AddMove(moveList, MakeMove(60, 58, MoveFlags.queen_castle))
                }
            }
        }
    }
    else {
        if (IsSquareAttacked(pieceBoards, occupancy, 4, Side.white)) return
        if (castlingRights & CastlingRights.BlackKing) {
            if (!(occupancy[Side.both] & KingsideBlack)) {
                if (!IsSquareAttacked(pieceBoards, occupancy, 5, Side.white) &&
                    !IsSquareAttacked(pieceBoards, occupancy, 6, Side.white)) {
                    AddMove(moveList, MakeMove(4, 6, MoveFlags.king_castle))
                }
            }
        }
        if (castlingRights & CastlingRights.BlackQueen) {
            if (!(occupancy[Side.both] & QueensideBlack)) {
                if (!IsSquareAttacked(pieceBoards, occupancy, 1, Side.white) &&
                    !IsSquareAttacked(pieceBoards, occupancy, 2, Side.white) &&
                    !IsSquareAttacked(pieceBoards, occupancy, 3, Side.white)) {
                    AddMove(moveList, MakeMove(4, 2, MoveFlags.queen_castle))
                }
            }
        }
    }
}