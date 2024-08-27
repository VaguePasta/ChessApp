import {GameMap} from "./board";
export function NewGame(token: string): void {
    GameMap.set(token, {
        state: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        moves: [],
        bitboards: new BigUint64Array(17),
    })
}