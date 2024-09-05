import {PieceSymbols} from "../bitboard/bit_boards";
import {GetBit} from "../bitboard/bit_operations";
import {MoveList} from "../moves/move";
import {ParseFEN} from "../fen/parse";
export const FENStart = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
export interface Game {
    GameState: GameState
    LegalMoveList: MoveList
}
export interface GameState {
    PieceBitboards: BigUint64Array;
    OccupancyBoards: BigUint64Array;
    PinnedBoards: BigUint64Array;
    SideToMove: number;
    EnPassantSquare: number;
    CastlingRight: number;
    HalfMoves: number;
    FullMoves: number
    PastPositions: Array<bigint>
}
export function NewGame(FEN: string): Game|null {
    let game = {
        GameState: {
            PieceBitboards: new BigUint64Array(12),
            OccupancyBoards: new BigUint64Array(3),
            PinnedBoards: new BigUint64Array(2),
            SideToMove: 0,
            EnPassantSquare: -1,
            CastlingRight: new Uint8Array([0b1111])[0],
            HalfMoves: 0,
            FullMoves: 1,
            PastPositions: new Array<bigint>()
        },
        LegalMoveList: {moves: new Uint16Array(218), count: 0}
    }
    if (ParseFEN(game.GameState, FEN) !== -1) {
        return game
    }
    else return null
}
export function PrintGameState(game: GameState) {
    let bitboards = game.PieceBitboards
    let board: string = ""
    board += "    a b c d e f g h\n"
    for (let rank = 0; rank < 8; rank++) {
        board += (8 - rank) + "   "
        for (let file = 0; file < 8; file++) {
            let index = rank * 8 + file
            if (game.EnPassantSquare !== -1 && game.EnPassantSquare === index) {
                board += "x "
                continue
            }
            let piece: boolean = false
            for (let i = 0; i < 12; i++) {
                if (GetBit(bitboards[i], BigInt(index))) {
                    board += PieceSymbols[i] + " "
                    piece = true
                    break
                }
            }
            if (!piece) {
                board += ". "
            }
        }
        board += "\n"
    }
    board += "Castling rights: " +
        ((game.CastlingRight & 1) ? "K" : "-") +
        (((game.CastlingRight >>> 1) & 1) ? "Q" : "-") +
        (((game.CastlingRight >>> 2) & 1) ? "k" : "-") +
        (((game.CastlingRight >>> 3) & 1) ? "q" : "-") + " | "
    board += (game.SideToMove ? "Black" : "White") + " to move | "
    board += "Half moves: " + game.HalfMoves + " | Full moves: " + game.FullMoves
    console.log(board)
}