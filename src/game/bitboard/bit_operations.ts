export function GetBit(bitboard: bigint, index: bigint): bigint {
    return (bitboard >> index) & 1n
}
export function SetBit(bitboard: bigint, index: bigint): bigint {
    return bitboard | (1n << (index))
}
export function ClearBit(bitboard: bigint, index: bigint): bigint {
    return bitboard & ~(1n << index)
}
export function CountSetBit(bitboard: bigint): bigint {
    bitboard = bitboard - ((bitboard >> 1n) & ((1n << (64n - 1n)) - 1n) & 0x5555555555555555n);
    bitboard = (bitboard & 0x3333333333333333n) + ((bitboard >> 2n) & ((1n << (64n - 2n)) - 1n) & 0x3333333333333333n);
    return ((((bitboard + ((bitboard >> 4n) & ((1n << (64n - 4n)) - 1n))) & 0xF0F0F0F0F0F0F0Fn) * 0x101010101010101n) >> 56n) & ((1n << (64n - 56n)) - 1n);
}
export function LeastSignificantOneIndex(bitboard: bigint) {
    return CountSetBit((bitboard & -bitboard) - 1n)
}
export function RightShift(bitboard: bigint, index: bigint) {
    return (bitboard >> index) & ((1n <<  (64n - index)) - 1n)
}
export function PrintBoard(bitboard: bigint) {
    let board: string = ""
    board += "    a  b  c  d  e  f  g  h\n"
    for (let rank: bigint = 0n; rank < 8n; rank++) {
        board += (8n - rank) + "   "
        for (let file: bigint = 0n; file < 8n; file++) {
            board += ((bitboard >> rank * 8n + file) & 1n) + "  "
        }
        board += "\n"
    }
    console.log(board)
}