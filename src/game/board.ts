export interface ChessGame {
    moves: string[];
}
export const GameMap = new Map<string, ChessGame>()
export function PrintBoard(bitboard: bigint) {
    let board: string = ""
    board += "    a b c d e f g h\n"
    for (let rank: bigint = 0n; rank < 8n; rank++) {
        board += (BigInt(8) - rank) + "   "
        for (let file: bigint = 0n; file < 8n; file++) {
            board += GetBit(bitboard, rank * 8n + file) + " "
        }
        board += "\n"
    }
    console.log(board)
}
export function GetBit(bitboard: bigint, index: bigint) {
    return (bitboard >> BigInt(index)) & 1n
}
export function SetBit(bitboard: bigint, index: bigint): bigint {
    return bitboard | (1n << BigInt(index))
}
export function ClearBit(bitboard: bigint, index: bigint): bigint {
    return bitboard & ~(1n << BigInt(index))
}
export function RightShift(bitboard: bigint, index: bigint) {
    return (bitboard >> index) & ((1n <<  (64n - index)) - 1n)
}
export function AlgebraicToIndex(algebraic: string): number {
    let file = algebraic[0]   //File: Column a-h
    let rank = parseInt(algebraic[1])   //Rank: Row 1-8
    switch (file) {
        case 'a':
            return 8 * (8 - rank)
        case 'b':
            return 1 + 8 * (8 - rank)
        case 'c':
            return 2 + 8 * (8 - rank)
        case 'd':
            return 3 + 8 * (8 - rank)
        case 'e':
            return 4 + 8 * (8 - rank)
        case 'f':
            return 5 + 8 * (8 - rank)
        case 'g':
            return 6 + 8 * (8 - rank)
        case 'h':
            return 7 + 8 * (8 - rank)
    }
    return 0
}
export function IndexToAlgebraic(index: number): string {
    return 'abcdefgh'.charAt(index % 8) + (8 - Math.floor(index/8))
}