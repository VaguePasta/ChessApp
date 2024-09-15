export function AlgebraicToIndex(algebraic: string): number {
    let file = algebraic[0]   //File: Column a-h
    let rank = Number(algebraic[1])  //Rank: Row 1-8
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
    return -1
}
export function IndexToAlgebraic(index: bigint): string {
    return 'abcdefgh'.charAt(Number(index % 8n)) + (8n - (index/8n))
}