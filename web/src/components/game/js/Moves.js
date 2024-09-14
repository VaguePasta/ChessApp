export function GetSourceSquare(move) {
    return move & 0b111111
}
export function GetTargetSquare(move) {
    return (move & 0xfc0) >>> 6
}
export function MakeMove(sourceSquare, targetSquare) {
    return sourceSquare | (targetSquare << 6)
}
export function GetMoveFlag(move) {
    return (move & 0xf000) >>> 12
}