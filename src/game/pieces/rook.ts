import {AlgebraicToIndex, CountSetBit, PrintBoard, RightShift, SetBit} from "../board";
import {GenerateOccupancyBoard} from "../magic_board/occupancies";
import {GenerateBishopAttackTables, GetBishopAttacks} from "./bishop";
export const RookRelevancyBitCounts: Uint8Array = new Uint8Array([
    12, 11, 11, 11, 11, 11, 11, 12,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    12, 11, 11, 11, 11, 11, 11, 12
])
export const RookMagicNumber: BigUint64Array = new BigUint64Array([
    36033815703207936n,
    2359886342185308160n,
    144134980359454752n,
    1188967893946074240n,
    72066394426183682n,
    4683744712011023360n,
    9403516571738964224n,
    4755801489979736097n,
    281616714858504n,
    281613490487552n,
    27162404108370560n,
    844493655966232n,
    2896377549309363296n,
    2393088198705664n,
    290763659532107780n,
    6923440003260055808n,
    14123431917705494824n,
    13511073764220928n,
    1739665439677489153n,
    288266660186427392n,
    144257575234372608n,
    3603020989174121472n,
    4611687122234245632n,
    2333570493447177217n,
    140877074808832n,
    1153009466610819076n,
    9008303062393920n,
    5188709866714185736n,
    864972624907206672n,
    562958543884292n,
    292736466860216360n,
    9367569765613535316n,
    909797494018277504n,
    9511672783906545684n,
    9011666029126784n,
    99642176685740096n,
    3175046535545095168n,
    9228438603632279560n,
    3530964013645070856n,
    13651539633643776n,
    2324279762996068352n,
    35185714282498n,
    4611968730375979024n,
    4504149517434896n,
    1407684125720592n,
    55732475020312592n,
    228732795355138n,
    72075478827139073n,
    6917810779643323648n,
    282025302966784n,
    9800118799755657472n,
    184717988096770560n,
    18018798704001152n,
    1157429504428343424n,
    4656724248352621568n,
    77405629366819072n,
    324281305141477506n,
    867036949431468066n,
    2005581183355010n,
    1157426341453824005n,
    9836143069811968001n,
    1407666941854337n,
    564118318874756n,
    108227405587677218n,
])
const RookAttackMask: BigUint64Array = new BigUint64Array(64)
export const RookAttackTables: Array<BigUint64Array> = Array.from(Array(64), () => new BigUint64Array(4096))
export function GenerateRookAttackTables() {
    for (let i = 0n; i < 64; i++) {
        RookAttackMask[Number(i)] = MaskRookAttacks(i)
        let relevantBitcounts = CountSetBit(RookAttackMask[Number(i)])
        let occupancyIndices = (1n << relevantBitcounts)
        for (let index = 0n; index < occupancyIndices; index++) {
            let occupancy = GenerateOccupancyBoard(index, relevantBitcounts, RookAttackMask[Number(i)])
            let magic_index = RightShift((occupancy * RookMagicNumber[Number(i)]), BigInt(64 - RookRelevancyBitCounts[Number(i)]))
            RookAttackTables[Number(i)][Number(magic_index)] = GenerateRookAttacks(i, occupancy)
        }
    }
}
export function MaskRookAttacks(index: bigint): bigint {
    let attackBoard: bigint = 0n
    for (let rank = (index / 8n) + 1n; rank <= 6n; rank++) {
        attackBoard |= 1n << (rank * 8n + (index % 8n))
    }
    for (let rank = (index / 8n) - 1n; rank >= 1n; rank--) {
        attackBoard |= 1n << (rank * 8n + (index % 8n))
    }
    for (let file = (index % 8n) + 1n; file <= 6n; file++) {
        attackBoard |= 1n << ((index / 8n) * 8n + file)
    }
    for (let file = (index % 8n) - 1n; file >= 1n; file--) {
        attackBoard |= 1n << ((index / 8n) * 8n + file)
    }
    return attackBoard
}
export function GenerateRookAttacks(index: bigint, blockTable: bigint): bigint {
    let attackBoard: bigint = 0n
    for (let rank = (index / 8n) + 1n; rank <= 7n; rank++) {
        attackBoard |= 1n << (rank * 8n + (index % 8n))
        if ((1n << (rank * 8n + (index % 8n))) & blockTable) break
    }
    for (let rank = (index / 8n) - 1n; rank >= 0n; rank--) {
        attackBoard |= 1n << (rank * 8n + (index % 8n))
        if ((1n << (rank * 8n + (index % 8n))) & blockTable) break
    }
    for (let file = (index % 8n) + 1n; file <= 7n; file++) {
        attackBoard |= 1n << ((index / 8n) * 8n + file)
        if ((1n << ((index / 8n) * 8n + file)) & blockTable) break
    }
    for (let file = (index % 8n) - 1n; file >= 0n; file--) {
        attackBoard |= 1n << ((index / 8n) * 8n + file)
        if ((1n << ((index / 8n) * 8n + file)) & blockTable) break
    }
    return attackBoard
}
export function GetRookAttacks(index: bigint, occupancy: bigint): bigint {
    occupancy &= RookAttackMask[Number(index)]
    occupancy *= RookMagicNumber[Number(index)]
    occupancy = RightShift(occupancy, BigInt(64 - RookRelevancyBitCounts[Number(index)]))
    return RookAttackTables[Number(index)][Number(occupancy)]
}