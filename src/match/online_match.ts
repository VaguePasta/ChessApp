import {FENStart} from "../game/engine/game";
import {GenerateMoves} from "../game/moves/movegen";
import {CompressMatch} from "./save";
import {DatabaseConn} from "../database/init";
import {Match, Matches, PlayMove} from "./match";

export function StartOnlineMatch(match: Match | undefined) {
    if (!match) return
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
                value.Connection.on('message', async (data: any) => {
                    if (game.GameState.SideToMove === value.Side) {
                        match.Moves += BigInt(parseInt(data)) << BigInt(16 * match.MoveCount)
                        match.MoveCount++
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
                                match.Players[1 - index].Connection.send("You lost.")
                                match.Players[index].Connection.removeAllListeners()
                                match.Players[1 - index].Connection.removeAllListeners()
                                match.Players[0].Connection.close()
                                match.Players[1].Connection.close()
                                break
                            case 2:
                                match.Players[1 - index].Connection.send(new Uint16Array([parseInt(data)]).buffer)
                                match.Players[0].Connection.send("Stalemate.")
                                match.Players[1].Connection.send("Stalemate.")
                                match.Players[index].Connection.removeAllListeners()
                                match.Players[1 - index].Connection.removeAllListeners()
                                match.Players[0].Connection.close()
                                match.Players[1].Connection.close()
                                break
                            case 3:
                                match.Players[1 - index].Connection.send(new Uint16Array([parseInt(data)]).buffer)
                                match.Players[0].Connection.send("Draw by 50-move rule.")
                                match.Players[1].Connection.send("Draw by 50-move rule.")
                                match.Players[index].Connection.removeAllListeners()
                                match.Players[1 - index].Connection.removeAllListeners()
                                match.Players[0].Connection.close()
                                match.Players[1].Connection.close()
                                break
                            case 4:
                                match.Players[1 - index].Connection.send(new Uint16Array([parseInt(data)]).buffer)
                                match.Players[0].Connection.send("Draw by threefold repetition.")
                                match.Players[1].Connection.send("Draw by threefold repetition.")
                                match.Players[index].Connection.removeAllListeners()
                                match.Players[1 - index].Connection.removeAllListeners()
                                match.Players[0].Connection.close()
                                match.Players[1].Connection.close()
                                break
                            case 5:
                                match.Players[1 - index].Connection.send(new Uint16Array([parseInt(data)]).buffer)
                                match.Players[0].Connection.send("Draw by insufficient material.")
                                match.Players[1].Connection.send("Draw by insufficient material.")
                                match.Players[index].Connection.removeAllListeners()
                                match.Players[1 - index].Connection.removeAllListeners()
                                match.Players[0].Connection.close()
                                match.Players[1].Connection.close()
                                break
                        }
                        let white_player = !match.Players[0].Side ? match.Players[0].Userid : match.Players[1].Userid
                        let black_player = match.Players[0].Side ? match.Players[0].Userid : match.Players[1].Userid
                        await DatabaseConn`insert into game_records(white_player, black_player, moves, date_added) values (${white_player}, ${black_player}, ${CompressMatch(match.Moves)}, localtimestamp(0))`
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
