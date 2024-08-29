import {GameMap} from "./board";
export function NewGame(token: string): void {
    GameMap.set(token, {
        moves: [],
    })
}