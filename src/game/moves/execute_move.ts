import {GameState} from "../engine/game";
import {CastlingRights, Pieces, Side} from "../bitboard/bit_boards";
import {MiscellaneousKey, PiecePositionKey} from "../positions/init";
import {GetMoveFlag, GetMoveSource, GetMoveTarget, GivenSquarePiece, MoveFlags} from "./move";
import {UpdatePinnedPieces} from "./updates";

export function ExecuteMove(gameInfo: GameState, move: number): GameState {
    let game = structuredClone(gameInfo)
    let flag = GetMoveFlag(move)
    let source = BigInt(GetMoveSource(move))
    let target = BigInt(GetMoveTarget(move))
    game.EnPassantSquare = -1
    let ZobristHash = game.PastPositions[0]
    if (game.SideToMove === Side.black) game.FullMoves++
    let movePiece = GivenSquarePiece(source, game.PieceBitboards)
    if (movePiece === Pieces.K) {
        game.CastlingRight = (game.CastlingRight & 0b1100)
        ZobristHash = ZobristHash ^ MiscellaneousKey[0] ^ MiscellaneousKey[1]
    } else if (movePiece === Pieces.k) {
        game.CastlingRight = (game.CastlingRight & 0b0011)
        ZobristHash = ZobristHash ^ MiscellaneousKey[2] ^ MiscellaneousKey[3]
    } else if (movePiece === Pieces.R) {
        if (source === 63n && (game.CastlingRight & CastlingRights.WhiteKing)) {
            game.CastlingRight = game.CastlingRight & ~CastlingRights.WhiteKing
            ZobristHash = ZobristHash ^ MiscellaneousKey[0]
        } else if (source === 56n && (game.CastlingRight & CastlingRights.WhiteQueen)) {
            game.CastlingRight = game.CastlingRight & ~CastlingRights.WhiteQueen
            ZobristHash = ZobristHash ^ MiscellaneousKey[1]
        }
    } else if (movePiece === Pieces.r) {
        if (source === 7n && (game.CastlingRight & CastlingRights.BlackKing)) {
            game.CastlingRight = game.CastlingRight & ~CastlingRights.BlackKing
            ZobristHash = ZobristHash ^ MiscellaneousKey[2]
        } else if (source === 0n && (game.CastlingRight & CastlingRights.BlackQueen)) {
            game.CastlingRight = game.CastlingRight & ~CastlingRights.BlackQueen
            ZobristHash = ZobristHash ^ MiscellaneousKey[3]
        }
    }
    if (flag === MoveFlags.capture || flag === MoveFlags.queen_promo_capture ||
        flag === MoveFlags.knight_promo_capture || flag === MoveFlags.bishop_promo_capture ||
        flag === MoveFlags.rook_promo_capture
    ) {
        let targetPiece = GivenSquarePiece(target, game.PieceBitboards)
        if (targetPiece === Pieces.R && target === 63n && (game.CastlingRight & CastlingRights.WhiteKing)) {
            game.CastlingRight = game.CastlingRight & ~CastlingRights.WhiteKing
            ZobristHash = ZobristHash ^ MiscellaneousKey[0]
        } else if (targetPiece === Pieces.R && target === 56n && (game.CastlingRight & CastlingRights.WhiteQueen)) {
            game.CastlingRight = game.CastlingRight & ~CastlingRights.WhiteQueen
            ZobristHash = ZobristHash ^ MiscellaneousKey[1]
        } else if (targetPiece === Pieces.r && target === 7n && (game.CastlingRight & CastlingRights.BlackKing)) {
            game.CastlingRight = game.CastlingRight & ~CastlingRights.BlackKing
            ZobristHash = ZobristHash ^ MiscellaneousKey[2]
        } else if (targetPiece === Pieces.r && target === 0n && (game.CastlingRight & CastlingRights.BlackQueen)) {
            game.CastlingRight = game.CastlingRight & ~CastlingRights.BlackQueen
            ZobristHash = ZobristHash ^ MiscellaneousKey[3]
        }
    }
    let targetPiece
    switch (flag) {
        case MoveFlags.quiet_moves:
            if (movePiece === Pieces.P || movePiece === Pieces.p) {
                game.HalfMoves = 0
                game.PastPositions.length = 0
            } else game.HalfMoves++
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source)
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] | (1n << (target))
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source)
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target))
            ZobristHash = ZobristHash ^ PiecePositionKey[movePiece][Number(source)] ^ PiecePositionKey[movePiece][Number(target)] ^ MiscellaneousKey[game.SideToMove ? 4 : 5] ^ MiscellaneousKey[game.SideToMove ? 5 : 4]
            game.PastPositions.unshift(ZobristHash)
            break
        case MoveFlags.capture:
            targetPiece = GivenSquarePiece(target, game.PieceBitboards)
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source)
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] | (1n << (target))
            game.PieceBitboards[targetPiece] = game.PieceBitboards[targetPiece] & ~(1n << target)
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source)
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target))
            game.OccupancyBoards[1 - game.SideToMove] = game.OccupancyBoards[1 - game.SideToMove] & ~(1n << target)
            game.HalfMoves = 0
            game.PastPositions.length = 0
            ZobristHash = ZobristHash ^ PiecePositionKey[movePiece][Number(source)] ^ PiecePositionKey[movePiece][Number(target)] ^ PiecePositionKey[targetPiece][Number(target)] ^ MiscellaneousKey[game.SideToMove ? 5 : 4] ^ MiscellaneousKey[game.SideToMove ? 4 : 5]
            game.PastPositions.unshift(ZobristHash)
            break
        case MoveFlags.double_push:
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source)
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] | (1n << (target))
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source)
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target))
            game.EnPassantSquare = game.SideToMove ? Number(target) - 8 : Number(target) + 8
            game.HalfMoves = 0
            game.PastPositions.length = 0
            ZobristHash = ZobristHash ^ PiecePositionKey[movePiece][Number(source)] ^ PiecePositionKey[movePiece][Number(target)] ^ MiscellaneousKey[game.SideToMove ? 5 : 4] ^ MiscellaneousKey[game.SideToMove ? 4 : 5]
            game.PastPositions.unshift(ZobristHash)
            break
        case MoveFlags.queen_castle:
            game.PieceBitboards[game.SideToMove ? Pieces.k : Pieces.K] = (game.PieceBitboards[game.SideToMove ? Pieces.k : Pieces.K] >> 2n) & 0x3fffffffffffffffn
            if (!game.SideToMove) {
                game.PieceBitboards[Pieces.R] = game.PieceBitboards[Pieces.R] & ~(1n << 56n)
                game.PieceBitboards[Pieces.R] = game.PieceBitboards[Pieces.R] | (1n << (59n))
                game.OccupancyBoards[Side.white] = game.OccupancyBoards[Side.white] & ~(1n << 56n)
                game.OccupancyBoards[Side.white] = game.OccupancyBoards[Side.white] & ~(1n << 60n)
                game.OccupancyBoards[Side.white] = game.OccupancyBoards[Side.white] | (1n << (58n))
                game.OccupancyBoards[Side.white] = game.OccupancyBoards[Side.white] | (1n << (59n))
                game.CastlingRight = game.CastlingRight & 0b1100
                game.PastPositions.length = 0
                ZobristHash = ZobristHash ^ PiecePositionKey[Pieces.R][56] ^ PiecePositionKey[Pieces.R][59] ^ PiecePositionKey[Pieces.K][60] ^ PiecePositionKey[Pieces.K][58] ^ MiscellaneousKey[game.SideToMove ? 4 : 5] ^ MiscellaneousKey[game.SideToMove ? 5 : 4]
                    ^ MiscellaneousKey[0] ^ MiscellaneousKey [1]
                game.PastPositions.unshift(ZobristHash)
            } else {
                game.PieceBitboards[Pieces.r] = game.PieceBitboards[Pieces.r] & ~(1n << 0n)
                game.PieceBitboards[Pieces.r] = game.PieceBitboards[Pieces.r] | (1n << (3n))
                game.OccupancyBoards[Side.black] = game.OccupancyBoards[Side.black] & ~(1n << 0n)
                game.OccupancyBoards[Side.black] = game.OccupancyBoards[Side.black] & ~(1n << 4n)
                game.OccupancyBoards[Side.black] = game.OccupancyBoards[Side.black] | (1n << (2n))
                game.OccupancyBoards[Side.black] = game.OccupancyBoards[Side.black] | (1n << (3n))
                game.CastlingRight = game.CastlingRight & 0b0011
                game.PastPositions.length = 0
                ZobristHash = ZobristHash ^ PiecePositionKey[Pieces.r][0] ^ PiecePositionKey[Pieces.r][3] ^ PiecePositionKey[Pieces.k][4] ^ PiecePositionKey[Pieces.k][2] ^ MiscellaneousKey[game.SideToMove ? 4 : 5] ^ MiscellaneousKey[game.SideToMove ? 5 : 4]
                    ^ MiscellaneousKey[2] ^ MiscellaneousKey [3]
                game.PastPositions.unshift(ZobristHash)
            }
            game.HalfMoves++
            break
        case MoveFlags.king_castle:
            game.PieceBitboards[game.SideToMove ? Pieces.k : Pieces.K] = (game.PieceBitboards[game.SideToMove ? Pieces.k : Pieces.K] << 2n)
            if (!game.SideToMove) {
                game.PieceBitboards[Pieces.R] = game.PieceBitboards[Pieces.R] & ~(1n << 63n)
                game.PieceBitboards[Pieces.R] = game.PieceBitboards[Pieces.R] | (1n << (61n))
                game.OccupancyBoards[Side.white] = game.OccupancyBoards[Side.white] & ~(1n << 60n)
                game.OccupancyBoards[Side.white] = game.OccupancyBoards[Side.white] & ~(1n << 63n)
                game.OccupancyBoards[Side.white] = game.OccupancyBoards[Side.white] | (1n << (61n))
                game.OccupancyBoards[Side.white] = game.OccupancyBoards[Side.white] | (1n << (62n))
                game.CastlingRight = game.CastlingRight & 0b1100
                game.PastPositions.length = 0
                ZobristHash = ZobristHash ^ PiecePositionKey[Pieces.R][63] ^ PiecePositionKey[Pieces.R][61] ^ PiecePositionKey[Pieces.K][60] ^ PiecePositionKey[Pieces.K][62] ^ MiscellaneousKey[game.SideToMove ? 4 : 5] ^ MiscellaneousKey[game.SideToMove ? 5 : 4]
                    ^ MiscellaneousKey[0] ^ MiscellaneousKey [1]
                game.PastPositions.unshift(ZobristHash)
            } else {
                game.PieceBitboards[Pieces.r] = game.PieceBitboards[Pieces.r] & ~(1n << 7n)
                game.PieceBitboards[Pieces.r] = game.PieceBitboards[Pieces.r] | (1n << (5n))
                game.OccupancyBoards[Side.black] = game.OccupancyBoards[Side.black] & ~(1n << 7n)
                game.OccupancyBoards[Side.black] = game.OccupancyBoards[Side.black] & ~(1n << 4n)
                game.OccupancyBoards[Side.black] = game.OccupancyBoards[Side.black] | (1n << (5n))
                game.OccupancyBoards[Side.black] = game.OccupancyBoards[Side.black] | (1n << (6n))
                game.CastlingRight = game.CastlingRight & 0b0011
                game.PastPositions.length = 0
                ZobristHash = ZobristHash ^ PiecePositionKey[Pieces.r][7] ^ PiecePositionKey[Pieces.r][5] ^ PiecePositionKey[Pieces.k][4] ^ PiecePositionKey[Pieces.k][6] ^ MiscellaneousKey[game.SideToMove ? 4 : 5] ^ MiscellaneousKey[game.SideToMove ? 5 : 4]
                    ^ MiscellaneousKey[2] ^ MiscellaneousKey [3]
                game.PastPositions.unshift(ZobristHash)
            }
            game.HalfMoves++
            break
        case MoveFlags.ep_capture:
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source)
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] | (1n << (target))
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source)
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target))
            let targetPosition = game.SideToMove ? target - 8n : target + 8n
            let targetPawn = game.SideToMove ? Pieces.P : Pieces.p
            game.PieceBitboards[targetPawn] = game.PieceBitboards[targetPawn] & ~(1n << targetPosition)
            game.OccupancyBoards[1 - game.SideToMove] = game.OccupancyBoards[1 - game.SideToMove] & ~(1n << targetPosition)
            game.HalfMoves = 0
            game.PastPositions.length = 0
            ZobristHash = ZobristHash ^ PiecePositionKey[movePiece][Number(source)] ^ PiecePositionKey[movePiece][Number(target)] ^ PiecePositionKey[targetPawn][Number(targetPosition)] ^ MiscellaneousKey[game.SideToMove ? 5 : 4] ^ MiscellaneousKey[game.SideToMove ? 4 : 5]
            game.PastPositions.unshift(ZobristHash)
            break
        case MoveFlags.knight_promotion:
            let knightType = game.SideToMove ? Pieces.n : Pieces.N
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source)
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source)
            game.PieceBitboards[knightType] = game.PieceBitboards[knightType] | (1n << (target))
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target))
            game.HalfMoves = 0
            game.PastPositions.length = 0
            ZobristHash = ZobristHash ^ PiecePositionKey[movePiece][Number(source)] ^ PiecePositionKey[knightType][Number(target)] ^ MiscellaneousKey[game.SideToMove ? 5 : 4] ^ MiscellaneousKey[game.SideToMove ? 4 : 5]
            game.PastPositions.unshift(ZobristHash)
            break
        case MoveFlags.rook_promotion:
            let rookType = game.SideToMove ? Pieces.r : Pieces.R
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source)
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source)
            game.PieceBitboards[rookType] = game.PieceBitboards[rookType] | (1n << (target))
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target))
            game.HalfMoves = 0
            game.PastPositions.length = 0
            ZobristHash = ZobristHash ^ PiecePositionKey[movePiece][Number(source)] ^ PiecePositionKey[rookType][Number(target)] ^ MiscellaneousKey[game.SideToMove ? 5 : 4] ^ MiscellaneousKey[game.SideToMove ? 4 : 5]
            game.PastPositions.unshift(ZobristHash)
            break
        case MoveFlags.bishop_promotion:
            let bishopType = game.SideToMove ? Pieces.b : Pieces.B
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source)
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source)
            game.PieceBitboards[bishopType] = game.PieceBitboards[bishopType] | (1n << (target))
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target))
            game.HalfMoves = 0
            game.PastPositions.length = 0
            ZobristHash = ZobristHash ^ PiecePositionKey[movePiece][Number(source)] ^ PiecePositionKey[bishopType][Number(target)] ^ MiscellaneousKey[game.SideToMove ? 5 : 4] ^ MiscellaneousKey[game.SideToMove ? 4 : 5]
            game.PastPositions.unshift(ZobristHash)
            break
        case MoveFlags.queen_promotion:
            let queenType = game.SideToMove ? Pieces.q : Pieces.Q
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source)
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source)
            game.PieceBitboards[queenType] = game.PieceBitboards[queenType] | (1n << (target))
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target))
            game.HalfMoves = 0
            game.PastPositions.length = 0
            ZobristHash = ZobristHash ^ PiecePositionKey[movePiece][Number(source)] ^ PiecePositionKey[queenType][Number(target)] ^ MiscellaneousKey[game.SideToMove ? 5 : 4] ^ MiscellaneousKey[game.SideToMove ? 4 : 5]
            game.PastPositions.unshift(ZobristHash)
            break
        case MoveFlags.knight_promo_capture:
            targetPiece = GivenSquarePiece(target, game.PieceBitboards)
            let kType = game.SideToMove ? Pieces.n : Pieces.N
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source)
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source)
            game.PieceBitboards[kType] = game.PieceBitboards[kType] | (1n << (target))
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target))
            game.PieceBitboards[targetPiece] = game.PieceBitboards[targetPiece] & ~(1n << target)
            game.OccupancyBoards[1 - game.SideToMove] = game.OccupancyBoards[1 - game.SideToMove] & ~(1n << target)
            game.HalfMoves = 0
            game.PastPositions.length = 0
            ZobristHash = ZobristHash ^ PiecePositionKey[movePiece][Number(source)] ^ PiecePositionKey[targetPiece][Number(target)] ^ PiecePositionKey[kType][Number(target)] ^ MiscellaneousKey[game.SideToMove ? 5 : 4] ^ MiscellaneousKey[game.SideToMove ? 4 : 5]
            game.PastPositions.unshift(ZobristHash)
            break
        case MoveFlags.rook_promo_capture:
            targetPiece = GivenSquarePiece(target, game.PieceBitboards)
            let rType = game.SideToMove ? Pieces.r : Pieces.R
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source)
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source)
            game.PieceBitboards[rType] = game.PieceBitboards[rType] | (1n << (target))
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target))
            game.PieceBitboards[targetPiece] = game.PieceBitboards[targetPiece] & ~(1n << target)
            game.OccupancyBoards[1 - game.SideToMove] = game.OccupancyBoards[1 - game.SideToMove] & ~(1n << target)
            game.HalfMoves = 0
            game.PastPositions.length = 0
            ZobristHash = ZobristHash ^ PiecePositionKey[movePiece][Number(source)] ^ PiecePositionKey[targetPiece][Number(target)] ^ PiecePositionKey[rType][Number(target)] ^ MiscellaneousKey[game.SideToMove ? 5 : 4] ^ MiscellaneousKey[game.SideToMove ? 4 : 5]
            game.PastPositions.unshift(ZobristHash)
            break
        case MoveFlags.bishop_promo_capture:
            targetPiece = GivenSquarePiece(target, game.PieceBitboards)
            let bType = game.SideToMove ? Pieces.b : Pieces.B
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source)
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source)
            game.PieceBitboards[bType] = game.PieceBitboards[bType] | (1n << (target))
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target))
            game.PieceBitboards[targetPiece] = game.PieceBitboards[targetPiece] & ~(1n << target)
            game.OccupancyBoards[1 - game.SideToMove] = game.OccupancyBoards[1 - game.SideToMove] & ~(1n << target)
            game.HalfMoves = 0
            game.PastPositions.length = 0
            ZobristHash = ZobristHash ^ PiecePositionKey[movePiece][Number(source)] ^ PiecePositionKey[targetPiece][Number(target)] ^ PiecePositionKey[bType][Number(target)] ^ MiscellaneousKey[game.SideToMove ? 5 : 4] ^ MiscellaneousKey[game.SideToMove ? 4 : 5]
            game.PastPositions.unshift(ZobristHash)
            break
        case MoveFlags.queen_promo_capture:
            targetPiece = GivenSquarePiece(target, game.PieceBitboards)
            let qType = game.SideToMove ? Pieces.q : Pieces.Q
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source)
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source)
            game.PieceBitboards[qType] = game.PieceBitboards[qType] | (1n << (target))
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target))
            game.PieceBitboards[targetPiece] = game.PieceBitboards[targetPiece] & ~(1n << target)
            game.OccupancyBoards[1 - game.SideToMove] = game.OccupancyBoards[1 - game.SideToMove] & ~(1n << target)
            game.HalfMoves = 0
            game.PastPositions.length = 0
            ZobristHash = ZobristHash ^ PiecePositionKey[movePiece][Number(source)] ^ PiecePositionKey[targetPiece][Number(target)] ^ PiecePositionKey[qType][Number(target)] ^ MiscellaneousKey[game.SideToMove ? 5 : 4] ^ MiscellaneousKey[game.SideToMove ? 4 : 5]
            game.PastPositions.unshift(ZobristHash)
            break
    }
    game.OccupancyBoards[Side.both] = (game.OccupancyBoards[Side.white] | game.OccupancyBoards[Side.black])
    game.SideToMove = 1 - game.SideToMove
    game.PinnedBoards[game.SideToMove] = UpdatePinnedPieces(game, game.SideToMove)
    return game
}