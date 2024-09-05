import {GameState} from "../engine/game";
import {AlgebraicToIndex} from "../bitboard/conversions";
import {Pieces, Side} from "../bitboard/bit_boards";
import {SetBit} from "../bitboard/bit_operations";
import {UpdatePinnedPieces} from "../moves/move";
import {HashFromState} from "../positions/zobrist_hashing";
/*
      A FEN string contains six fields:
      0: Pieces positions.
      1: Active color.
      2: Castling availability.
      3: En passant square.
      4: Half-move clock.
      5: Full-move clock.
    */
enum FENfields {
    positions, active_color, castling, en_passant, half_move, full_move
}
export function ParseFEN(game: GameState, fenString: string): number {
    let FEN: string[] = fenString.split(" ")
    //Parse active color
    switch (FEN[FENfields.active_color]) {
        case 'w':
            game.SideToMove = Side.white
            break
        case 'b':
            game.SideToMove = Side.black
            break
        default:
            return -1
    }
    //Parse en passant square
    if (FEN[FENfields.en_passant] !== '-') {
        let enPassantSq = Number(AlgebraicToIndex(FEN[FENfields.en_passant]))
        if (enPassantSq === -1) {
            return -1
        }
        game.EnPassantSquare = enPassantSq
    }
    else game.EnPassantSquare = -1
    //Parse half-move clock
    game.HalfMoves = parseInt(FEN[FENfields.half_move])
    if (isNaN(game.HalfMoves)) {
        return -1
    }
    //Parse full-move clock
    game.FullMoves = parseInt(FEN[FENfields.full_move])
    if (isNaN(game.FullMoves)) {
        return -1
    }
    //Parse castling rights
    if (FEN[FENfields.castling] === "-") {
            game.CastlingRight = 0
    }
    else {
        let castling = FEN[FENfields.castling]
        let castlingRights: number = 0
        for (let index = 0; index < castling.length; index++) {
            switch (castling.charAt(index)) {
                case 'K':
                    castlingRights |= 0b0001
                    break
                case 'Q':
                    castlingRights |= 0b0010
                    break
                case 'k':
                    castlingRights |= 0b0100
                    break
                case 'q':
                    castlingRights |= 0b1000
                    break
                case '-':
                    break
                default:
                    return -1
            }
        }
        game.CastlingRight = castlingRights
    }
    //Parse positions
    let count: bigint = 0n
    let positions = FEN[FENfields.positions]
    for (let index = 0; index < positions.length; index++) {
        switch (positions.charAt(index)) {
            case 'P':
                game.PieceBitboards[Pieces.P] = SetBit(game.PieceBitboards[Pieces.P], count)
                count++
                break
            case 'N':
                game.PieceBitboards[Pieces.N] = SetBit(game.PieceBitboards[Pieces.N], count)
                count++
                break
            case 'B':
                game.PieceBitboards[Pieces.B] = SetBit(game.PieceBitboards[Pieces.B], count)
                count++
                break
            case 'R':
                game.PieceBitboards[Pieces.R] = SetBit(game.PieceBitboards[Pieces.R], count)
                count++
                break
            case 'Q':
                game.PieceBitboards[Pieces.Q] = SetBit(game.PieceBitboards[Pieces.Q], count)
                count++
                break
            case 'K':
                game.PieceBitboards[Pieces.K] = SetBit(game.PieceBitboards[Pieces.K], count)
                count++
                break
            case 'p':
                game.PieceBitboards[Pieces.p] = SetBit(game.PieceBitboards[Pieces.p], count)
                count++
                break
            case 'n':
                game.PieceBitboards[Pieces.n] = SetBit(game.PieceBitboards[Pieces.n], count)
                count++
                break
            case 'b':
                game.PieceBitboards[Pieces.b] = SetBit(game.PieceBitboards[Pieces.b], count)
                count++
                break
            case 'r':
                game.PieceBitboards[Pieces.r] = SetBit(game.PieceBitboards[Pieces.r], count)
                count++
                break
            case 'q':
                game.PieceBitboards[Pieces.q] = SetBit(game.PieceBitboards[Pieces.q], count)
                count++
                break
            case 'k':
                game.PieceBitboards[Pieces.k] = SetBit(game.PieceBitboards[Pieces.k], count)
                count++
                break
            case '1':
                count += 1n
                break
            case '2':
                count += 2n
                break
            case '3':
                count += 3n
                break
            case '4':
                count += 4n
                break
            case '5':
                count += 5n
                break
            case '6':
                count += 6n
                break
            case '7':
                count += 7n
                break
            case '8':
                count += 8n
                break
            case '/':
                break
            default:
                return -1
        }
    }
    if (count !== 64n) {
        return -1
    }
    game.OccupancyBoards[Side.white] = (game.PieceBitboards[Pieces.P] | game.PieceBitboards[Pieces.N] | game.PieceBitboards[Pieces.B] | game.PieceBitboards[Pieces.R] | game.PieceBitboards[Pieces.Q] | game.PieceBitboards[Pieces.K])
    game.OccupancyBoards[Side.black] = (game.PieceBitboards[Pieces.p] | game.PieceBitboards[Pieces.n] | game.PieceBitboards[Pieces.b] | game.PieceBitboards[Pieces.r] | game.PieceBitboards[Pieces.q] | game.PieceBitboards[Pieces.k])
    game.OccupancyBoards[Side.both] = (game.OccupancyBoards[Side.white] | game.OccupancyBoards[Side.black])
    game.PinnedBoards[1 - game.SideToMove] = UpdatePinnedPieces(game)
    game.PastPositions.unshift(HashFromState(game))
    return 0
}