import {GenerateMoves} from "../moves/movegen";
import {GameInfo} from "./game";
import {ExecuteMove} from "../moves/move";

export function Perft(game: GameInfo, depth: number): number {
    let i: number;
    let nodes: number = 0
    if (depth == 0) {
        return 1
    }
    let moveList = GenerateMoves(game)
    for (i = 0; i < moveList.count; i++) {
        let GameCopy = structuredClone(game)
        ExecuteMove(GameCopy, moveList.moves[i])
        nodes += Perft(game, depth - 1)
    }
    return nodes
}