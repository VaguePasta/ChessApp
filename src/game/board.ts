export interface ChessGame {
    state: string;
    moves: string[];
    bitboards: BigUint64Array
}
export const GameMap = new Map<string, ChessGame>()