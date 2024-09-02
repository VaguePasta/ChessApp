import {GenerateMoves} from "../moves/movegen";
import {Game, GameInfo} from "./game";
import {ExecuteMove, PrintMove} from "../moves/move";

export function Perft(game: GameInfo, depth: number): number {
    let i: number;
    let nodes: number = 0
    let moveList = GenerateMoves(game)
    if (depth == 1) {
        return moveList.count
    }
    if (depth == 0) {
        return 1
    }
    for (i = 0; i < moveList.count; i++) {
        let GameCopy = structuredClone(game)
        game = ExecuteMove(game, moveList.moves[i])
        nodes += Perft(game, depth - 1)
        game = GameCopy
    }
    return nodes
}
export function Divide(game: GameInfo, depth: number) {
    let total = 0
    let moveList = GenerateMoves(game)
    for (let i = 0; i < moveList.count; i++) {
        let GameCopy = structuredClone(game)
        GameCopy = ExecuteMove(GameCopy, moveList.moves[i])
        let nodes_at = Perft(GameCopy, depth - 1)
        console.log(PrintMove(moveList.moves[i], game.SideToMove) + ": " + nodes_at)
        total += nodes_at
    }
    console.log("Node searched:", total)
}