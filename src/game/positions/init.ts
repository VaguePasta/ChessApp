import crypto = require('crypto')
export const PiecePositionKey = Array.from(Array(12), () => new BigUint64Array(64))
export const EnPassantFile = new BigUint64Array(8)
// Four for castling, 2 for side to move.
export const MiscellaneousKey = new BigUint64Array(6)
export function GenerateZobristRandoms() {
    for (let i = 0; i < 12; i++) {
        for (let j = 0; j < 64; j++) {
            PiecePositionKey[i][j] = crypto.randomBytes(8).readBigUInt64BE(0)
        }
    }
    for (let i = 0; i < 8; i++) {
        EnPassantFile[i] = crypto.randomBytes(8).readBigUInt64BE(0)
    }
    for (let i = 0; i < 5; i++) {
        MiscellaneousKey[i] = crypto.randomBytes(8).readBigUInt64BE(0)
    }
}