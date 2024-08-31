export function AlgebraicToIndex(algebraic: string): bigint {
    let file = algebraic[0]   //File: Column a-h
    let rank = BigInt(algebraic[1])   //Rank: Row 1-8
    switch (file) {
        case 'a':
            return 8n * (8n - rank)
        case 'b':
            return 1n + 8n * (8n - rank)
        case 'c':
            return 2n + 8n * (8n - rank)
        case 'd':
            return 3n + 8n * (8n - rank)
        case 'e':
            return 4n + 8n * (8n - rank)
        case 'f':
            return 5n + 8n * (8n - rank)
        case 'g':
            return 6n + 8n * (8n - rank)
        case 'h':
            return 7n + 8n * (8n - rank)
    }
    return -1n
}
export function IndexToAlgebraic(index: bigint): string {
    return 'abcdefgh'.charAt(Number(index % 8n)) + (8n - (index/8n))
}