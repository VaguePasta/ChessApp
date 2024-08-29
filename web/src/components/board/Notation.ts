export enum AlgebraicRemainder {
    a = 0,
    b = 1,
    c = 2,
    d = 3,
    e = 4,
    f = 5,
    g = 6,
    h = 7,
}
export function AlgebraicToIndex(algebraic: string): number {
    let file = algebraic[0]   //File: Column a-h
    let rank = parseInt(algebraic[1])   //Rank: Row 1-8
    switch (file) {
        case 'a':
            return AlgebraicRemainder.a + 8 * (8 - rank)
        case 'b':
            return AlgebraicRemainder.b + 8 * (8 - rank)
        case 'c':
            return AlgebraicRemainder.c + 8 * (8 - rank)
        case 'd':
            return AlgebraicRemainder.d + 8 * (8 - rank)
        case 'e':
            return AlgebraicRemainder.e + 8 * (8 - rank)
        case 'f':
            return AlgebraicRemainder.f + 8 * (8 - rank)
        case 'g':
            return AlgebraicRemainder.g + 8 * (8 - rank)
        case 'h':
            return AlgebraicRemainder.h + 8 * (8 - rank)
    }
    return 0
}
export function IndexToAlgebraic(index: number): string {
    return 'abcdefgh'.charAt(index % 8) + (8 - Math.floor(index/8))
}