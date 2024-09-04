import {GenerateMoves} from "../moves/movegen";
import {GameState} from "./game";
import {ExecuteMove, GenMoveString} from "../moves/move";

export function Perft(game: GameState, depth: number): number {
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
export function Divide(game: GameState, depth: number) {
    let total = 0
    let moveList = GenerateMoves(game)
    for (let i = 0; i < moveList.count; i++) {
        let GameCopy = structuredClone(game)
        GameCopy = ExecuteMove(GameCopy, moveList.moves[i])
        let nodes_at = Perft(GameCopy, depth - 1)
        console.log(GenMoveString(moveList.moves[i], game.SideToMove) + ": " + nodes_at)
        total += nodes_at
    }
    console.log("Node searched:", total)
}