import {GetRookAttacks} from "../pieces/rook";
import {GetBishopAttacks} from "../pieces/bishop";

export const LinesIntersect: Array<BigUint64Array> = Array.from(Array(64), () => new BigUint64Array(64))
export const LinesBetween: Array<BigUint64Array> = Array.from(Array(64), () => new BigUint64Array(64))
export function GenerateLineBetween() {
    for (let i = 0n; i < 64n; i++) {
        for (let j = 0n; j < 64n; j++) {
            if (i == j) continue
            let dif = Math.abs(Number(i - j))
            if ((dif < 8n && i / 8n === j / 8n) || (i - j) % 8n === 0n) {
                LinesIntersect[Number(i)][Number(j)] = (GetRookAttacks(i, 0n) & GetRookAttacks(j, 0n)) | (1n << i) | (1n << j)
                LinesBetween[Number(i)][Number(j)] = GetRookAttacks(i, 1n << j) & GetRookAttacks(j, 1n << i)
            } else if (dif % 9 === 0 || dif % 7 == 0) {
                LinesIntersect[Number(i)][Number(j)] = ((GetBishopAttacks(i, 0n) & GetBishopAttacks(j, 0n)) | (1n << i) | (1n << j))
                LinesBetween[Number(i)][Number(j)] = GetBishopAttacks(i, 1n << j) & GetBishopAttacks(j, 1n << i)
            }
            else {
                LinesIntersect[Number(i)][Number(j)] = 0n
                LinesBetween[Number(i)][Number(j)] = 0n
            }
        }
    }
}
