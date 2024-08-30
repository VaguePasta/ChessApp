import {ClearBit, CountSetBit, LeastSignificantOneIndex, RightShift} from "../board";
import {GenerateBishopAttacks, MaskBishopAttacks} from "../pieces/bishop";
import {GenerateRookAttacks, MaskRookAttacks} from "../pieces/rook";
import crypto = require('crypto')
export function GenerateOccupancyBoard(set_index: bigint, mask_bits_count: bigint, attackboard: bigint): bigint {
    let occupancy: bigint = 0n
    for (let count: bigint = 0n; count < mask_bits_count; count++) {
        let index: bigint = LeastSignificantOneIndex(attackboard)
        attackboard = ClearBit(attackboard, index)
        if (set_index & (1n << count)) {
            occupancy |= (1n << index)
        }
    }
    return occupancy
}
function GenerateRandomNumber(): bigint {
    crypto.randomBytes(8).readBigUInt64BE(0)
    return crypto.randomBytes(8).readBigUInt64BE(0)
}
function RandomBigInt(): bigint {
    let u1: bigint, u2: bigint, u3: bigint, u4: bigint;
    u1 = (GenerateRandomNumber()) & 0xFFFFn; u2 = (GenerateRandomNumber()) & 0xFFFFn;
    u3 = (GenerateRandomNumber()) & 0xFFFFn; u4 = (GenerateRandomNumber()) & 0xFFFFn;
    return u1 | (u2 << 16n) | (u3 << 32n) | (u4 << 48n);
}
function RandomLowSetBit(): bigint {
    return RandomBigInt() & RandomBigInt() & RandomBigInt();
}
function GenerateMagicNumber(index: bigint, relevantBitCounts: bigint, isBishop: number): bigint {
    let occupancies: BigUint64Array = new BigUint64Array(4096)
    let attackTables: BigUint64Array = new BigUint64Array(4096)
    let usedAttacks: BigUint64Array
    let attackMask: bigint = isBishop ? MaskBishopAttacks(index) : MaskRookAttacks(index)
    let occupancyIndices: bigint = 1n << relevantBitCounts
    for (let oIndex = 0n; oIndex < occupancyIndices; oIndex++) {
        occupancies[Number(oIndex)] = GenerateOccupancyBoard(oIndex, relevantBitCounts, attackMask)
        attackTables[Number(oIndex)] = isBishop ? GenerateBishopAttacks(index, occupancies[Number(oIndex)]) :
            GenerateRookAttacks(index, occupancies[Number(oIndex)])
    }
    for (let randomCount = 0; randomCount < 1000000; randomCount++) {
        let magicNumber: bigint = RandomLowSetBit();
        if (CountSetBit((attackMask * magicNumber) & 0xFF00000000000000n) < 6n) continue
        usedAttacks = new BigUint64Array(4096)
        let tIndex: number, fail: number
        for (tIndex = 0, fail = 0; !fail && tIndex < occupancyIndices; tIndex++) {
            let magic_index: bigint = RightShift((occupancies[tIndex] * magicNumber), (64n - relevantBitCounts))
            if (usedAttacks[Number(magic_index)] === 0n) {
                usedAttacks[Number(magic_index)] = attackTables[tIndex]
            }
            else if (usedAttacks[Number(magic_index)] !== attackTables[tIndex]) {
                fail = 1
            }
        }
        if (!fail) {
            return magicNumber
        }
    }
    return 0n
}