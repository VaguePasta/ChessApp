import {Active_sessions} from "../auth/account";
import {DatabaseConn} from "../database/init";
const NumberOfPuzzles = 4200322
export async function GetPuzzle(req: any): Promise<string|null> {
    let token = req.header('authorization')
    if (!token || !Active_sessions.get(token)) {
        return null
    }
    let random_id = Math.floor(Math.random() * NumberOfPuzzles + 1)
    const puzzle = await DatabaseConn`select fen, moves, rating, rating_deviation, theme from puzzles where puzzle_id = ${random_id}`
    return JSON.stringify({
        fen: puzzle[0].fen,
        moves: puzzle[0].moves,
        rating: puzzle[0].rating,
        rating_deviation: puzzle[0].rating_deviation,
        theme: puzzle[0].theme
    })
}