import {IndexToAlgebraic} from "../bitboard/conversions";
import {CastlingRights, PieceName, Pieces, Side} from "../bitboard/bit_boards";
import {GameInfo, PrintGameState} from "../engine/game";
import {
    ClearBit,
    CountSetBit,
    LeastSignificantOneIndex, PrintBoard,
    RightShift,
    SetBit
} from "../bitboard/bit_operations";
import {IsKingInCheck} from "./attacks";
import {LinesBetween, LinesIntersect} from "../bitboard/consts";
import {GetBishopAttacks} from "../pieces/bishop";
import {GetRookAttacks} from "../pieces/rook";

export const FromSquareMask = 0x3f
export const ToSquareMask = 0xfc0
export const MoveFlagsMask = 0xf000
export enum MoveFlags {
    quiet_moves, double_push, king_castle, queen_castle,
    capture, ep_capture,
    knight_promotion = 8, bishop_promotion,
    rook_promotion, queen_promotion, knight_promo_capture,
    bishop_promo_capture, rook_promo_capture, queen_promo_capture
}
/*
    A move is encoded using 2 bytes:
    0000 0000 0000 0000
    0000 0000 0011 1111 : From square
    0000 1111 1100 0000 : To square
    1111 0000 0000 0000 : Flags
    Flags:
    code 	promotion 	capture 	special 1 	special 0 	kind of move
 _______________________________________________________________________________
      0 	    0 	        0 	        0 	        0 	    quiet moves
      1 	    0 	        0 	        0 	        1 	    double pawn push
      2 	    0 	        0 	        1 	        0 	    king castle
      3 	    0 	        0 	        1 	        1 	    queen castle
      4 	    0 	        1 	        0 	        0 	    captures
      5 	    0 	        1 	        0 	        1 	    ep-capture
      8 	    1 	        0 	        0 	        0 	    knight-promotion
      9 	    1 	        0 	        0       	1   	bishop-promotion
     10 	    1 	        0 	        1       	0 	    rook-promotion
     11 	    1 	        0 	        1       	1 	    queen-promotion
     12 	    1 	        1 	        0       	0 	    knight-promo capture
     13 	    1 	        1 	        0       	1 	    bishop-promo capture
     14 	    1 	        1       	1       	0 	    rook-promo capture
     15 	    1 	        1       	1 	        1 	    queen-promo capture
 ________________________________________________________________________________

*/
export interface MoveList {
    moves: Uint16Array
    count: number
}
export function AddMove(moveList: MoveList, move: number) {
    moveList.moves[moveList.count] = move
    moveList.count++
}
export function MakeMove(source: number, target: number, flag: number): number {
    return source | target << 6 | flag << 12
}
export function GetMoveSource(move: number): number {
    return move & FromSquareMask
}
export function GetMoveTarget(move: number): number {
    return (move & ToSquareMask) >>> 6
}
export function GetMoveFlag(move: number) {
    return (move & MoveFlagsMask) >>> 12
}
export function GivenSquarePiece(index: bigint, bitboards: BigUint64Array, side: number): number {
    let bit_check = 1n << index
    if (!side) {
        for (let i = 0; i < 7; i++) {
            if (bitboards[i] & bit_check) return i
        }
    }
    else {
        for (let i = 6; i < 12; i++) {
            if (bitboards[i] & bit_check) return i
        }
    }
    return -1
}
export function MoveCapture(move: number): boolean {
    return ((move & MoveFlagsMask) >>> 12 & MoveFlags.capture & MoveFlags.ep_capture & MoveFlags.bishop_promo_capture &
        MoveFlags.knight_promo_capture & MoveFlags.queen_promo_capture & MoveFlags.rook_promo_capture) !== 0
}
export function MovePromotion(move: number, side: number): number {
    let flag = (move & MoveFlagsMask) >>> 12
    if (flag === MoveFlags.bishop_promotion || flag === MoveFlags.bishop_promo_capture) {
        return side ? Pieces.b : Pieces.B
    }
    if (flag === MoveFlags.rook_promotion || flag === MoveFlags.rook_promo_capture) {
        return side ? Pieces.r : Pieces.R
    }
    if (flag === MoveFlags.knight_promotion || flag === MoveFlags.knight_promo_capture) {
        return side ? Pieces.n : Pieces.N
    }
    if (flag === MoveFlags.queen_promotion || flag === MoveFlags.queen_promo_capture) {
        return side ? Pieces.q : Pieces.Q
    }
    return 0
}
function IsCastling(move: number): number {
    let flag = (move & MoveFlagsMask) >>> 12
    if (flag === MoveFlags.king_castle) return 1
    else if (flag === MoveFlags.queen_castle) return -1
    return 0
}
export function TryMoves(game: GameInfo, pseudoLegalMoves: MoveList): MoveList {
    let LegalMoves = {
        count: 0,
        moves: new Uint16Array(218)
    }
    let GameCopy: GameInfo = structuredClone(game)
    let movePiece
    let move
    if (IsKingInCheck(game, 1 - game.SideToMove)) {
        for (let i = 0; i < pseudoLegalMoves.count; i++) {
            move = pseudoLegalMoves.moves[i]
            game = ExecuteMove(game, move)
            if (!IsKingInCheck(game, game.SideToMove)) {
                LegalMoves.moves[LegalMoves.count] = move
                LegalMoves.count++
            }
            game = structuredClone(GameCopy)
        }
    }
    else for (let i = 0; i < pseudoLegalMoves.count; i++) {
        move = pseudoLegalMoves.moves[i]
        if (GetMoveFlag(move) === MoveFlags.ep_capture) {
            game = ExecuteMove(game, move)
            if (!IsKingInCheck(game, game.SideToMove)) {
                LegalMoves.moves[LegalMoves.count] = move
                LegalMoves.count++
            }
            game = structuredClone(GameCopy)
            continue
        }
        movePiece = GivenSquarePiece(BigInt(GetMoveSource(move)), game.PieceBitboards, game.SideToMove)
        if (movePiece == Pieces.k || movePiece === Pieces.K) {
            game = ExecuteMove(game, move)
            if (!IsKingInCheck(game, game.SideToMove)) {
                LegalMoves.moves[LegalMoves.count] = move
                LegalMoves.count++
            }
            game = structuredClone(GameCopy)
            continue
        }
        let source = GetMoveSource(move)
        let target = GetMoveTarget(move)
        if (LinesIntersect[source][target] & game.PieceBitboards[game.SideToMove ? Pieces.k : Pieces.K]) {
            LegalMoves.moves[LegalMoves.count] = move
            LegalMoves.count++
            continue
        }
        if (!(game.PinnedBoards[game.SideToMove] & (1n << BigInt(source)))) {
            LegalMoves.moves[LegalMoves.count] = move
            LegalMoves.count++
        }
    //     game = ExecuteMove(game, move)
    //     if (!IsKingInCheck(game)) {
    //         LegalMoves.moves[LegalMoves.count] = move
    //         LegalMoves.count++
    //     }
    //     game = structuredClone(GameCopy)
    }
    return LegalMoves
}
export function ExecuteMove(gameInfo: GameInfo, move: number): GameInfo {
    let game = structuredClone(gameInfo)
    let flag = GetMoveFlag(move)
    let source = BigInt(GetMoveSource(move))
    let target = BigInt(GetMoveTarget(move))
    game.EnPassantSquare = -1
    if (game.SideToMove === Side.black) game.FullMoves++
    let movePiece = GivenSquarePiece(source, game.PieceBitboards, game.SideToMove)
    if (movePiece === Pieces.K) {
        game.CastlingRight = (game.CastlingRight & 0b1100)
    } else if (movePiece === Pieces.k) {
        game.CastlingRight = (game.CastlingRight & 0b0011)
    } else if (movePiece === Pieces.R) {
        if (source === 63n && (game.CastlingRight & CastlingRights.WhiteKing)){
            game.CastlingRight = game.CastlingRight & ~CastlingRights.WhiteKing
        }
        else if (source === 56n && (game.CastlingRight & CastlingRights.WhiteQueen)) {
            game.CastlingRight = game.CastlingRight & ~CastlingRights.WhiteQueen
        }
    } else if (movePiece === Pieces.r) {
        if (source === 7n && (game.CastlingRight & CastlingRights.BlackKing)) {
            game.CastlingRight = game.CastlingRight & ~CastlingRights.BlackKing
        }
        else if (source === 0n && (game.CastlingRight & CastlingRights.BlackQueen)) {
            game.CastlingRight = game.CastlingRight & ~CastlingRights.BlackQueen
        }
    }
    if (flag === MoveFlags.capture || flag === MoveFlags.queen_promo_capture ||
        flag === MoveFlags.knight_promo_capture || flag === MoveFlags.bishop_promo_capture ||
        flag === MoveFlags.rook_promo_capture
    ) {
        let targetPiece = GivenSquarePiece(target, game.PieceBitboards, 1 - game.SideToMove)
        if (targetPiece === Pieces.R && target === 63n && (game.CastlingRight & CastlingRights.WhiteKing)) {
            game.CastlingRight = game.CastlingRight & ~CastlingRights.WhiteKing
        }
        else if (targetPiece === Pieces.R && target === 56n && (game.CastlingRight & CastlingRights.WhiteQueen)) {
            game.CastlingRight = game.CastlingRight & ~CastlingRights.WhiteQueen
        }
        else if (targetPiece === Pieces.r && target === 7n && (game.CastlingRight & CastlingRights.BlackKing)) {
            game.CastlingRight = game.CastlingRight & ~CastlingRights.BlackKing
        }
        else if (targetPiece === Pieces.r && target === 0n && (game.CastlingRight & CastlingRights.BlackQueen)) {
            game.CastlingRight = game.CastlingRight & ~CastlingRights.BlackQueen
        }
    }
    let targetPiece
    switch (flag) {
        case MoveFlags.quiet_moves:
            if (movePiece === Pieces.P || movePiece === Pieces.p) game.HalfMoves = 0
            else game.HalfMoves++
            game.PieceBitboards[movePiece] = ClearBit(game.PieceBitboards[movePiece], source)
            game.PieceBitboards[movePiece] = SetBit(game.PieceBitboards[movePiece], target)
            game.OccupancyBoards[game.SideToMove] = ClearBit(game.OccupancyBoards[game.SideToMove], source)
            game.OccupancyBoards[game.SideToMove] = SetBit(game.OccupancyBoards[game.SideToMove], target)
            break
        case MoveFlags.capture:
            targetPiece = GivenSquarePiece(target, game.PieceBitboards, 1 - game.SideToMove)
            game.PieceBitboards[movePiece] = ClearBit(game.PieceBitboards[movePiece], source)
            game.PieceBitboards[movePiece] = SetBit(game.PieceBitboards[movePiece], target)
            game.PieceBitboards[targetPiece] = ClearBit(game.PieceBitboards[targetPiece], target)
            game.OccupancyBoards[game.SideToMove] = ClearBit(game.OccupancyBoards[game.SideToMove], source)
            game.OccupancyBoards[game.SideToMove] = SetBit(game.OccupancyBoards[game.SideToMove], target)
            game.OccupancyBoards[1 - game.SideToMove] = ClearBit(game.OccupancyBoards[1 - game.SideToMove], target)
            game.HalfMoves = 0
            break
        case MoveFlags.double_push:
            game.PieceBitboards[movePiece] = ClearBit(game.PieceBitboards[movePiece], source)
            game.PieceBitboards[movePiece] = SetBit(game.PieceBitboards[movePiece], target)
            game.OccupancyBoards[game.SideToMove] = ClearBit(game.OccupancyBoards[game.SideToMove], source)
            game.OccupancyBoards[game.SideToMove] = SetBit(game.OccupancyBoards[game.SideToMove], target)
            game.EnPassantSquare = game.SideToMove ? Number(target) - 8 : Number(target) + 8
            game.HalfMoves = 0
            break
        case MoveFlags.queen_castle:
            game.PieceBitboards[game.SideToMove ? Pieces.k : Pieces.K] = RightShift(game.PieceBitboards[game.SideToMove ? Pieces.k : Pieces.K], 2n)
            if (!game.SideToMove) {
                game.PieceBitboards[Pieces.R] = ClearBit(game.PieceBitboards[Pieces.R], 56n)
                game.PieceBitboards[Pieces.R] = SetBit(game.PieceBitboards[Pieces.R], 59n)
                game.OccupancyBoards[Side.white] = ClearBit(game.OccupancyBoards[Side.white], 56n)
                game.OccupancyBoards[Side.white] = ClearBit(game.OccupancyBoards[Side.white], 60n)
                game.OccupancyBoards[Side.white] = SetBit(game.OccupancyBoards[Side.white], 58n)
                game.OccupancyBoards[Side.white] = SetBit(game.OccupancyBoards[Side.white], 59n)
                game.CastlingRight = game.CastlingRight & 0b1100
            }
            else {
                game.PieceBitboards[Pieces.r] = ClearBit(game.PieceBitboards[Pieces.r], 0n)
                game.PieceBitboards[Pieces.r] = SetBit(game.PieceBitboards[Pieces.r], 3n)
                game.OccupancyBoards[Side.black] = ClearBit(game.OccupancyBoards[Side.black], 0n)
                game.OccupancyBoards[Side.black] = ClearBit(game.OccupancyBoards[Side.black], 4n)
                game.OccupancyBoards[Side.black] = SetBit(game.OccupancyBoards[Side.black], 2n)
                game.OccupancyBoards[Side.black] = SetBit(game.OccupancyBoards[Side.black], 3n)
                game.CastlingRight = game.CastlingRight & 0b0011
            }
            game.HalfMoves++
            break
        case MoveFlags.king_castle:
            game.PieceBitboards[game.SideToMove ? Pieces.k : Pieces.K] = (game.PieceBitboards[game.SideToMove ? Pieces.k : Pieces.K] << 2n)
            if (!game.SideToMove) {
                game.PieceBitboards[Pieces.R] = ClearBit(game.PieceBitboards[Pieces.R], 63n)
                game.PieceBitboards[Pieces.R] = SetBit(game.PieceBitboards[Pieces.R], 61n)
                game.OccupancyBoards[Side.white] = ClearBit(game.OccupancyBoards[Side.white], 60n)
                game.OccupancyBoards[Side.white] = ClearBit(game.OccupancyBoards[Side.white], 63n)
                game.OccupancyBoards[Side.white] = SetBit(game.OccupancyBoards[Side.white], 61n)
                game.OccupancyBoards[Side.white] = SetBit(game.OccupancyBoards[Side.white], 62n)
                game.CastlingRight = game.CastlingRight & 0b1100
            }
            else {
                game.PieceBitboards[Pieces.r] = ClearBit(game.PieceBitboards[Pieces.r], 7n)
                game.PieceBitboards[Pieces.r] = SetBit(game.PieceBitboards[Pieces.r], 5n)
                game.OccupancyBoards[Side.black] = ClearBit(game.OccupancyBoards[Side.black], 7n)
                game.OccupancyBoards[Side.black] = ClearBit(game.OccupancyBoards[Side.black], 4n)
                game.OccupancyBoards[Side.black] = SetBit(game.OccupancyBoards[Side.black], 5n)
                game.OccupancyBoards[Side.black] = SetBit(game.OccupancyBoards[Side.black], 6n)
                game.CastlingRight = game.CastlingRight & 0b0011
            }
            game.HalfMoves++
            break
        case MoveFlags.ep_capture:
            game.PieceBitboards[movePiece] = ClearBit(game.PieceBitboards[movePiece], source)
            game.PieceBitboards[movePiece] = SetBit(game.PieceBitboards[movePiece], target)
            game.OccupancyBoards[game.SideToMove] = ClearBit(game.OccupancyBoards[game.SideToMove], source)
            game.OccupancyBoards[game.SideToMove] = SetBit(game.OccupancyBoards[game.SideToMove], target)
            let targetPosition = game.SideToMove ? target - 8n : target + 8n
            let targetPawn = game.SideToMove ? Pieces.P : Pieces.p
            game.PieceBitboards[targetPawn] = ClearBit(game.PieceBitboards[targetPawn], targetPosition)
            game.OccupancyBoards[1 - game.SideToMove] = ClearBit(game.OccupancyBoards[1 - game.SideToMove], targetPosition)
            game.HalfMoves = 0
            break
        case MoveFlags.knight_promotion:
            let knightType = game.SideToMove ? Pieces.n : Pieces.N
            game.PieceBitboards[movePiece] = ClearBit(game.PieceBitboards[movePiece], source)
            game.OccupancyBoards[game.SideToMove] = ClearBit(game.OccupancyBoards[game.SideToMove], source)
            game.PieceBitboards[knightType] = SetBit(game.PieceBitboards[knightType], target)
            game.OccupancyBoards[game.SideToMove] = SetBit(game.OccupancyBoards[game.SideToMove], target)
            game.HalfMoves = 0
            break
        case MoveFlags.rook_promotion:
            let rookType = game.SideToMove ? Pieces.r : Pieces.R
            game.PieceBitboards[movePiece] = ClearBit(game.PieceBitboards[movePiece], source)
            game.OccupancyBoards[game.SideToMove] = ClearBit(game.OccupancyBoards[game.SideToMove], source)
            game.PieceBitboards[rookType] = SetBit(game.PieceBitboards[rookType], target)
            game.OccupancyBoards[game.SideToMove] = SetBit(game.OccupancyBoards[game.SideToMove], target)
            game.HalfMoves = 0
            break
        case MoveFlags.bishop_promotion:
            let bishopType = game.SideToMove ? Pieces.b : Pieces.B
            game.PieceBitboards[movePiece] = ClearBit(game.PieceBitboards[movePiece], source)
            game.OccupancyBoards[game.SideToMove] = ClearBit(game.OccupancyBoards[game.SideToMove], source)
            game.PieceBitboards[bishopType] = SetBit(game.PieceBitboards[bishopType], target)
            game.OccupancyBoards[game.SideToMove] = SetBit(game.OccupancyBoards[game.SideToMove], target)
            game.HalfMoves = 0
            break
        case MoveFlags.queen_promotion:
            let queenType = game.SideToMove ? Pieces.q : Pieces.Q
            game.PieceBitboards[movePiece] = ClearBit(game.PieceBitboards[movePiece], source)
            game.OccupancyBoards[game.SideToMove] = ClearBit(game.OccupancyBoards[game.SideToMove], source)
            game.PieceBitboards[queenType] = SetBit(game.PieceBitboards[queenType], target)
            game.OccupancyBoards[game.SideToMove] = SetBit(game.OccupancyBoards[game.SideToMove], target)
            game.HalfMoves = 0
            break
        case MoveFlags.knight_promo_capture:
            targetPiece = GivenSquarePiece(target, game.PieceBitboards, 1 - game.SideToMove)
            let kType = game.SideToMove ? Pieces.n : Pieces.N
            game.PieceBitboards[movePiece] = ClearBit(game.PieceBitboards[movePiece], source)
            game.OccupancyBoards[game.SideToMove] = ClearBit(game.OccupancyBoards[game.SideToMove], source)
            game.PieceBitboards[kType] = SetBit(game.PieceBitboards[kType], target)
            game.OccupancyBoards[game.SideToMove] = SetBit(game.OccupancyBoards[game.SideToMove], target)
            game.PieceBitboards[targetPiece] = ClearBit(game.PieceBitboards[targetPiece], target)
            game.OccupancyBoards[1 - game.SideToMove] = ClearBit(game.OccupancyBoards[1 - game.SideToMove], target)
            game.HalfMoves = 0
            break
        case MoveFlags.rook_promo_capture:
            targetPiece = GivenSquarePiece(target, game.PieceBitboards, 1 - game.SideToMove)
            let bType = game.SideToMove ? Pieces.r : Pieces.R
            game.PieceBitboards[movePiece] = ClearBit(game.PieceBitboards[movePiece], source)
            game.OccupancyBoards[game.SideToMove] = ClearBit(game.OccupancyBoards[game.SideToMove], source)
            game.PieceBitboards[bType] = SetBit(game.PieceBitboards[bType], target)
            game.OccupancyBoards[game.SideToMove] = SetBit(game.OccupancyBoards[game.SideToMove], target)
            game.PieceBitboards[targetPiece] = ClearBit(game.PieceBitboards[targetPiece], target)
            game.OccupancyBoards[1 - game.SideToMove] = ClearBit(game.OccupancyBoards[1 - game.SideToMove], target)
            game.HalfMoves = 0
            break
        case MoveFlags.bishop_promo_capture:
            targetPiece = GivenSquarePiece(target, game.PieceBitboards, 1 - game.SideToMove)
            let rType = game.SideToMove ? Pieces.b : Pieces.B
            game.PieceBitboards[movePiece] = ClearBit(game.PieceBitboards[movePiece], source)
            game.OccupancyBoards[game.SideToMove] = ClearBit(game.OccupancyBoards[game.SideToMove], source)
            game.PieceBitboards[rType] = SetBit(game.PieceBitboards[rType], target)
            game.OccupancyBoards[game.SideToMove] = SetBit(game.OccupancyBoards[game.SideToMove], target)
            game.PieceBitboards[targetPiece] = ClearBit(game.PieceBitboards[targetPiece], target)
            game.OccupancyBoards[1 - game.SideToMove] = ClearBit(game.OccupancyBoards[1 - game.SideToMove], target)
            game.HalfMoves = 0
            break
        case MoveFlags.queen_promo_capture:
            targetPiece = GivenSquarePiece(target, game.PieceBitboards, 1 - game.SideToMove)
            let qType = game.SideToMove ? Pieces.q : Pieces.Q
            game.PieceBitboards[movePiece] = ClearBit(game.PieceBitboards[movePiece], source)
            game.OccupancyBoards[game.SideToMove] = ClearBit(game.OccupancyBoards[game.SideToMove], source)
            game.PieceBitboards[qType] = SetBit(game.PieceBitboards[qType], target)
            game.OccupancyBoards[game.SideToMove] = SetBit(game.OccupancyBoards[game.SideToMove], target)
            game.PieceBitboards[targetPiece] = ClearBit(game.PieceBitboards[targetPiece], target)
            game.OccupancyBoards[1 - game.SideToMove] = ClearBit(game.OccupancyBoards[1 - game.SideToMove], target)
            game.HalfMoves = 0
            break
    }
    game.OccupancyBoards[Side.both] = (game.OccupancyBoards[Side.white] | game.OccupancyBoards[Side.black])
    game.SideToMove = 1 - game.SideToMove
    let kingIndex = LeastSignificantOneIndex(game.PieceBitboards[game.SideToMove ? Pieces.k : Pieces.K])
    let attack_map = (GetRookAttacks(kingIndex, game.OccupancyBoards[1 - game.SideToMove]) & (game.PieceBitboards[game.SideToMove ? Pieces.R : Pieces.r] | game.PieceBitboards[game.SideToMove ? Pieces.Q : Pieces.q]))
        | (GetBishopAttacks(kingIndex, game.OccupancyBoards[1 - game.SideToMove]) & (game.PieceBitboards[game.SideToMove ? Pieces.B : Pieces.b] | game.PieceBitboards[game.SideToMove ? Pieces.Q : Pieces.q]))
    let pinned_map: bigint = 0n
    while(attack_map) {
        let sniper = LeastSignificantOneIndex(attack_map)
        let intersection = LinesBetween[Number(sniper)][Number(kingIndex)] & game.OccupancyBoards[game.SideToMove]
        if (CountSetBit(intersection) === 1n) {
            pinned_map |= intersection
        }
        attack_map = ClearBit(attack_map, sniper)
    }
    game.PinnedBoards[game.SideToMove] = pinned_map
    return game
}

export function PrintMove(move: number, side: number) {
                          //, side: number, pieceBoards: BigUint64Array) {
    let moveString: string = ""
    // if (IsCastling(move) === 1) {
    //     moveString += "0-0"
    // }
    // else if (IsCastling(move) === -1) {
    //     moveString += "0-0-0"
    // }
    // else {
        let promotion = MovePromotion(move, side)
    //     moveString += PieceName.charAt(GivenSquarePiece(BigInt(move), pieceBoards, side))
        moveString += IndexToAlgebraic(BigInt(GetMoveSource(move)))
        // if (MoveCapture(move)) moveString += "x"
        moveString += IndexToAlgebraic(BigInt(GetMoveTarget(move)))
        if (promotion !== 0) moveString += PieceName.charAt(promotion)
        // if (((move & MoveFlagsMask) >>> 12) == 5) moveString += "e.p"
    // }
    return moveString
}