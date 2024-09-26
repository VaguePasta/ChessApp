import {IndexToAlgebraic} from "@/components/game/js/Notation.js";

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
export function GetNotation(move) {
    let move_string = IndexToAlgebraic(GetSourceSquare(move)) + IndexToAlgebraic(GetTargetSquare(move))
    let flag = GetMoveFlag(move)
    switch (flag) {
        case 8: case 12:
            move_string += 'n'
            break
        case 9: case 13:
            move_string += 'b'
            break
        case 10: case 14:
            move_string += 'r'
            break
        case 11: case 15:
            move_string += 'q'
            break
    }
    return move_string
}