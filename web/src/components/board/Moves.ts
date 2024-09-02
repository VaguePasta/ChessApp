export function GetSourceSquare(move: number) {
    return move & 0b111111
}
export function GetTargetSquare(move: number) {
    return (move >>> 6) & 0b111111
}
export function MakeMove(sourceSquare: number, targetSquare: number) {
    return sourceSquare | (targetSquare << 6)
}