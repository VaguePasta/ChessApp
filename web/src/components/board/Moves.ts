export function GetSourceSquare(move: number) {
    return move & 0b111111
}
export function GetTargetSquare(move: number) {
    return (move & 0xfc0) >>> 6
}
export function MakeMove(sourceSquare: number, targetSquare: number) {
    return sourceSquare | (targetSquare << 6)
}
export function GetMoveFlag(move): number {
    return (move & 0xf000) >>> 12
}