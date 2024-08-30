import {AlgebraicToIndex, CountSetBit, PrintBoard, RightShift, SetBit} from "../board";
import {GenerateOccupancyBoard} from "../magic_board/occupancies";

export const BishopRelevancyBitCounts: Uint8Array = new Uint8Array([
    6, 5, 5, 5, 5, 5, 5, 6,
    5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 7, 7, 7, 7, 5, 5,
    5, 5, 7, 9, 9, 7, 5, 5,
    5, 5, 7, 9, 9, 7, 5, 5,
    5, 5, 7, 7, 7, 7, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5,
    6, 5, 5, 5, 5, 5, 5, 6
])
export const BishopMagicNumbers: BigUint64Array = new BigUint64Array([
    74485402022453504n,
    81120052614596610n,
    1337626333731094864n,
    160198848461967364n,
    4639838053739790340n,
    14830496647418752848n,
    564119938052886n,
    4645163227168769n,
    351852456640768n,
    4612040132105633920n,
    290417165738248n,
    2314859298783559684n,
    1173188872239071763n,
    11867127989080948752n,
    1154120075394417664n,
    145382108951748608n,
    594492820346258432n,
    1157433934955464852n,
    2251868603425312n,
    11531748355822649856n,
    307370676730200064n,
    590253034760716560n,
    19217281745819716n,
    2306410666996794368n,
    1154117777018192896n,
    4688846514683118609n,
    571746063745056n,
    2384093636989059104n,
    27166741964529668n,
    9367559792702328835n,
    578714796388581632n,
    147378046833680n,
    144680410138284049n,
    4920202392836768832n,
    145840394835330048n,
    2310557749568635392n,
    2315413441889960456n,
    9307550668552276740n,
    4539342345769472n,
    2306195132115878928n,
    9223953696772071424n,
    2308239949394085889n,
    571902947004420n,
    4683745949330440450n,
    4650256890691846210n,
    2882954676729291016n,
    4796104252064000n,
    36341060770859136n,
    1155248088928485376n,
    286977102610448n,
    286190860242944n,
    2210097006848n,
    1152941313541406737n,
    36038902557049856n,
    11245507090101044256n,
    13741773637681152n,
    5071498592260096n,
    9255693322424320n,
    141323756111904n,
    90076545349093376n,
    9223375335658226184n,
    9223389903953090826n,
    571780674883680n,
    11533737371762197000n,
])
const BishopAttackMask: BigUint64Array = new BigUint64Array(64)
export const BishopAttackTables: Array<BigUint64Array> = Array.from(Array(64), () => new BigUint64Array(512))
export function GenerateBishopAttackTables() {
    for (let i = 0n; i < 64; i++) {
        BishopAttackMask[Number(i)] = MaskBishopAttacks(i)
        let relevantBitcounts = CountSetBit(BishopAttackMask[Number(i)])
        let occupancyIndices = (1n << relevantBitcounts)
        for (let index = 0n; index < occupancyIndices; index++) {
            let occupancy = GenerateOccupancyBoard(index, relevantBitcounts, BishopAttackMask[Number(i)])
            let magic_index = RightShift((occupancy * BishopMagicNumbers[Number(i)]), BigInt(64 - BishopRelevancyBitCounts[Number(i)]))
            BishopAttackTables[Number(i)][Number(magic_index)] = GenerateBishopAttacks(i, occupancy)
        }
    }
}
export function MaskBishopAttacks(index: bigint) {
    let attackBoard: bigint = 0n
    for (let rank = (index/8n) + 1n, file = (index % 8n) + 1n; rank <= 6n && file <= 6n; rank++, file++) {
        attackBoard |= (1n << (rank * 8n + file))
    }
    for (let rank = (index/8n) + 1n, file = (index % 8n) - 1n; rank <= 6n && file >= 1n; rank++, file--) {
        attackBoard |= (1n << (rank * 8n + file))
    }
    for (let rank = (index/8n) - 1n, file = (index % 8n) + 1n; rank >= 1n && file <= 6n; rank--, file++) {
        attackBoard |= (1n << (rank * 8n + file))
    }
    for (let rank = (index/8n) - 1n, file = (index % 8n) - 1n; rank >= 1n && file >= 1n; rank--, file--) {
        attackBoard |= (1n << (rank * 8n + file))
    }
    return attackBoard
}
export function GenerateBishopAttacks(index: bigint, blockTable: bigint) {
    let attackBoard: bigint = 0n
    for (let rank = (index/8n) + 1n, file = (index % 8n) + 1n; rank <= 7n && file <= 7n; rank++, file++) {
        attackBoard |= (1n << (rank * 8n + file))
        if ((1n << (rank * 8n + file)) & blockTable) break
    }
    for (let rank = (index/8n) + 1n, file = (index % 8n) - 1n; rank <= 7n && file >= 0n; rank++, file--) {
        attackBoard |= (1n << (rank * 8n + file))
        if ((1n << (rank * 8n + file)) & blockTable) break
    }
    for (let rank = (index/8n) - 1n, file = (index % 8n) + 1n; rank >= 0n && file <= 7n; rank--, file++) {
        attackBoard |= (1n << (rank * 8n + file))
        if ((1n << (rank * 8n + file)) & blockTable) break
    }
    for (let rank = (index/8n) - 1n, file = (index % 8n) - 1n; rank >= 0n && file >= 0n; rank--, file--) {
        attackBoard |= (1n << (rank * 8n + file))
        if ((1n << (rank * 8n + file)) & blockTable) break
    }
    return attackBoard
}
export function GetBishopAttacks(index: bigint, occupancy: bigint): bigint {
    occupancy &= BishopAttackMask[Number(index)]
    occupancy *= BishopMagicNumbers[Number(index)]
    occupancy = RightShift(occupancy, BigInt(64 - BishopRelevancyBitCounts[Number(index)]))
    return BishopAttackTables[Number(index)][Number(occupancy)]
}