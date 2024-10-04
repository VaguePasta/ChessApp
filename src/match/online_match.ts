import {FENStart} from "../game/engine/game";
import {GenerateMoves} from "../game/moves/movegen";
import {CompressMatch} from "./record";
import {DatabaseConn} from "../database/init";
import {Match, Matches, PlayMove} from "./match";

export function StartOnlineMatch(match: Match | undefined) {
    if (!match) return
    match.Players[0].Connection.send(btoa(FENStart + match.Players[0].Side))
    match.Players[1].Connection.send(btoa(FENStart + match.Players[1].Side))
    let winSide: string | null = null
    let matchResult: string | null = null
    match.Players.forEach((value, index) => {
        value.Connection.on('message', (data: any) => {
            if (data.toString() === "ok") {
                let game = match.Game
                if (!value.Side) {
                    game.LegalMoveList = GenerateMoves(game.GameState)
                    value.Connection.send(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count))
                }
                value.Connection.on('message', async (data: any) => {
                    if (game.GameState.SideToMove === value.Side) {
                        if (data.toString() === "Resign") {
                            match.Players[index].Connection.send("Lost by resignation.")
                            match.Players[1 - index].Connection.send("Your opponent has resigned.")
                            await DatabaseConn`update users set win = win + 1 where user_id = ${match.Players[1 - index].Userid}`
                            await DatabaseConn`update users set loss = loss + 1 where user_id = ${match.Players[index].Userid}`
                            winSide = match.Players[index].Side ? 'white' : 'black'
                            matchResult = 'resign'
                            match.Players[index].Connection.removeAllListeners()
                            match.Players[1 - index].Connection.removeAllListeners()
                            match.Players[0].Connection.close()
                            match.Players[1].Connection.close()
                        }
                        else {
                            match.Moves += (BigInt(parseInt(data)) << BigInt(16 * match.MoveCount++))
                            switch (PlayMove(parseInt(data), match.Game)) {
                                case 0:
                                    let moves = new Uint16Array(game.LegalMoveList.count + 1)
                                    moves.set(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count), 1)
                                    moves[0] = parseInt(data)
                                    match.Players[1 - index].Connection.send(moves)
                                    return
                                case 1:
                                    match.Players[1 - index].Connection.send(new Uint16Array([parseInt(data)]).buffer)
                                    match.Players[index].Connection.send("You won.")
                                    await DatabaseConn`update users set win = win + 1 where user_id = ${match.Players[index].Userid}`
                                    match.Players[1 - index].Connection.send("You lost.")
                                    await DatabaseConn`update users set loss = loss + 1 where user_id = ${match.Players[1-index].Userid}`
                                    winSide = match.Players[index].Side ? 'black' : 'white'
                                    matchResult = 'check'
                                    match.Players[index].Connection.removeAllListeners()
                                    match.Players[1 - index].Connection.removeAllListeners()
                                    match.Players[0].Connection.close()
                                    match.Players[1].Connection.close()
                                    break
                                case 2:
                                    match.Players[1 - index].Connection.send(new Uint16Array([parseInt(data)]).buffer)
                                    match.Players[0].Connection.send("Stalemate.")
                                    match.Players[1].Connection.send("Stalemate.")
                                    await DatabaseConn`update users set draw = draw + 1 where user_id = ${match.Players[index].Userid} or user_id = ${match.Players[1 - index].Userid}`
                                    winSide = 'draw'
                                    matchResult = 'stalemate'
                                    match.Players[index].Connection.removeAllListeners()
                                    match.Players[1 - index].Connection.removeAllListeners()
                                    match.Players[0].Connection.close()
                                    match.Players[1].Connection.close()
                                    break
                                case 3:
                                    match.Players[1 - index].Connection.send(new Uint16Array([parseInt(data)]).buffer)
                                    match.Players[0].Connection.send("Draw by 50-move rule.")
                                    match.Players[1].Connection.send("Draw by 50-move rule.")
                                    await DatabaseConn`update users set draw = draw + 1 where user_id = ${match.Players[index].Userid} or user_id = ${match.Players[1 - index].Userid}`
                                    winSide = 'draw'
                                    matchResult = '50'
                                    match.Players[index].Connection.removeAllListeners()
                                    match.Players[1 - index].Connection.removeAllListeners()
                                    match.Players[0].Connection.close()
                                    match.Players[1].Connection.close()
                                    break
                                case 4:
                                    match.Players[1 - index].Connection.send(new Uint16Array([parseInt(data)]).buffer)
                                    match.Players[0].Connection.send("Draw by threefold repetition.")
                                    match.Players[1].Connection.send("Draw by threefold repetition.")
                                    await DatabaseConn`update users set draw = draw + 1 where user_id = ${match.Players[index].Userid} or user_id = ${match.Players[1 - index].Userid}`
                                    winSide = 'draw'
                                    matchResult = '3'
                                    match.Players[index].Connection.removeAllListeners()
                                    match.Players[1 - index].Connection.removeAllListeners()
                                    match.Players[0].Connection.close()
                                    match.Players[1].Connection.close()
                                    break
                                case 5:
                                    match.Players[1 - index].Connection.send(new Uint16Array([parseInt(data)]).buffer)
                                    match.Players[0].Connection.send("Draw by insufficient material.")
                                    match.Players[1].Connection.send("Draw by insufficient material.")
                                    await DatabaseConn`update users set draw = draw + 1 where user_id = ${match.Players[index].Userid} or user_id = ${match.Players[1 - index].Userid}`
                                    winSide = 'draw'
                                    matchResult = 'mats'
                                    match.Players[index].Connection.removeAllListeners()
                                    match.Players[1 - index].Connection.removeAllListeners()
                                    match.Players[0].Connection.close()
                                    match.Players[1].Connection.close()
                                    break
                            }
                        }
                        let white_player = !match.Players[0].Side ? match.Players[0].Userid : match.Players[1].Userid
                        let black_player = match.Players[0].Side ? match.Players[0].Userid : match.Players[1].Userid
                        await DatabaseConn`insert into game_records(white_player, black_player, moves, date_added, win_side, result) values (${white_player}, ${black_player}, ${CompressMatch(match.Moves)}, localtimestamp(0), ${winSide}, ${matchResult})`
                    }
                })
            }
        })
        value.Connection.on('close', () => {
            Matches.delete(match.Token)
            match.Players[1 - index].Connection.send("The other player has lost connection.")
            match.Players[1 - index].Connection.close()
        })
    })

}
