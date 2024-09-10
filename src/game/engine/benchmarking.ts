import {NewGame} from "./game";
import {Perft} from "./perft";

export function Benchmark(FEN: string, depth: number, iterations: number) {
    let sum = 0
    // @ts-ignore
    let game = NewGame(FEN).GameState
    Perft(game, depth)
    for (let i = 0; i < iterations; i++) {
        performance.mark('A')
        Perft(game, depth)
        performance.mark('B')
        performance.measure('movegen', 'A', 'B')
        sum += performance.getEntriesByName('movegen')[0].duration
        performance.clearMarks()
        performance.clearMeasures()
    }
    console.log("Average: " + (sum/iterations).toFixed(3) + " ms.")
}