import {FENStart, Game, GameState, NewGame} from "../game/engine/game";
import {ExecuteMove, MoveList} from "../game/moves/move";
import {GenerateMoves} from "../game/moves/movegen";
import {IsKingInCheck} from "../game/moves/attacks";
import {Player} from "./player";
import {CountSetBit} from "../game/bitboard/bit_operations";
import {Pieces, Side} from "../game/bitboard/bit_boards";
import {CompressMatch} from "./save";

export interface Match {
    Game: Game
    Moves: bigint
    Token: string
    MoveCount: number
    Players: Array<Player>
}
export const Matches: Map<string, Match> = new Map<string, Match>()
export function NewMatch(token: string, FEN: string, player1: Player, player2: Player | undefined = undefined): boolean {
    let game = NewGame(FEN)
    if (game !== null) {
        Matches.set(token, {
            Game: game,
            Token: token,
            MoveCount: 0,
            Moves: 0n,
            Players: (player2 === undefined) ? [player1] : [player1, player2]
        })
        return true
    }
    else return false
}
export function StartMatch(match: Match | undefined) {
    if (match === undefined) return
    match.Players[0].Connection.send(FENStart + match.Players[0].Side)
    match.Players[1].Connection.send(FENStart + match.Players[1].Side)
    match.Players.forEach((value, index) => {
        value.Connection.on('message', (data: any) => {
            if (data.toString() === "ok") {
                let game = match.Game
                if (!value.Side) {
                    game.LegalMoveList = GenerateMoves(game.GameState)
                    value.Connection.send(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count))
                }
                value.Connection.on('message', (data: any) => {
                    if (game.GameState.SideToMove === value.Side) {
                        match.Moves += BigInt(parseInt(data)) << BigInt(16 * match.MoveCount)
                        match.MoveCount++
                        switch(PlayMove(parseInt(data), match.Game)) {
                            case 1:
                                match.Players[1 - index].Connection.send(new Uint16Array([parseInt(data)]).buffer)
                                match.Players[index].Connection.send("You won.")
                                match.Players[1 - index].Connection.send("You lost.")
                                match.Players[0].Connection.close()
                                match.Players[1].Connection.close()
                                Matches.delete(match.Token)
                                break
                            case 2:
                                match.Players[1 - index].Connection.send(new Uint16Array([parseInt(data)]).buffer)
                                match.Players[0].Connection.send("Stalemate.")
                                match.Players[1].Connection.send("Stalemate.")
                                match.Players[0].Connection.close()
                                match.Players[1].Connection.close()
                                Matches.delete(match.Token)
                                break
                            case 3:
                                match.Players[1 - index].Connection.send(new Uint16Array([parseInt(data)]).buffer)
                                match.Players[0].Connection.send("Draw by 50-move rule.")
                                match.Players[1].Connection.send("Draw by 50-move rule.")
                                match.Players[0].Connection.close()
                                match.Players[1].Connection.close()
                                Matches.delete(match.Token)
                                break
                            case 4:
                                match.Players[1 - index].Connection.send(new Uint16Array([parseInt(data)]).buffer)
                                match.Players[0].Connection.send("Draw by threefold repetition.")
                                match.Players[1].Connection.send("Draw by threefold repetition.")
                                match.Players[0].Connection.close()
                                match.Players[1].Connection.close()
                                Matches.delete(match.Token)
                                break
                            case 5:
                                match.Players[1 - index].Connection.send(new Uint16Array([parseInt(data)]).buffer)
                                match.Players[0].Connection.send("Draw by insufficient material.")
                                match.Players[1].Connection.send("Draw by insufficient material.")
                                match.Players[0].Connection.close()
                                match.Players[1].Connection.close()
                                Matches.delete(match.Token)
                                break
                            case 0:
                                game.LegalMoveList = GenerateMoves(game.GameState)
                                let moves = new Uint16Array(game.LegalMoveList.count + 1)
                                moves.set(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count), 1)
                                moves[0] = parseInt(data)
                                match.Players[1 - index].Connection.send(moves)
                                return
                        }
                        CompressMatch(match.Moves)
                    }
                })
                value.Connection.on('close', () => {
                    match.Players[1 - index].Connection.send("The other player has lost connection.")
                    match.Players[1 - index].Connection.close()
                })
            }
        })
    })

}
/*
    0: The game continues.
    1: The last side that moved won.
    2: Stalemate.
    3: Draw by 50-move rule.
    4: Draw by threefold repetition.
    5: Draw by insufficient material.
 */
function CheckEndGame(gameState: GameState, legalMoveList: MoveList) {
    if (legalMoveList.count === 0) {
        if (IsKingInCheck(gameState, 1 - gameState.SideToMove)) {
            return 1
        } else {
            return 2
        }
    }
    else if (gameState.HalfMoves >= 100) {
        return 3
    }
    let piecesLeft = CountSetBit(gameState.OccupancyBoards[Side.both])
    if (piecesLeft === 2n) {
        return 5
    }
    else if (piecesLeft === 3n) {
        if (CountSetBit(gameState.OccupancyBoards[Side.white]) === 1n) {
            if (gameState.PieceBitboards[Pieces.k] || gameState.PieceBitboards[Pieces.b]) {
                return 5
            }
        }
        else {
            if (gameState.PieceBitboards[Pieces.K] || gameState.PieceBitboards[Pieces.B]) {
                return 5
            }
        }
    }
    else if (piecesLeft === 4n && CountSetBit(gameState.OccupancyBoards[Side.white]) === 2n && CountSetBit(gameState.OccupancyBoards[Side.black]) === 2n) {
        if ((gameState.PieceBitboards[Pieces.k] || gameState.PieceBitboards[Pieces.b]) && (gameState.PieceBitboards[Pieces.K] || gameState.PieceBitboards[Pieces.B])) {
            return 5
        }
    }
    if (gameState.PastPositions.length >= 9) {
        let counter = 1
        for (let i = 0; i < gameState.PastPositions.length; i+=4) {
            if (gameState.PastPositions[0] !== gameState.PastPositions[i]) break
            else counter++
        }
        if (counter >= 3) return 4
    }
    return 0
}
export function PlayMove(move: number, game: Game) {
    game.GameState = ExecuteMove(game.GameState, move)
    game.LegalMoveList = GenerateMoves(game.GameState)
    return CheckEndGame(game.GameState, game.LegalMoveList)
}