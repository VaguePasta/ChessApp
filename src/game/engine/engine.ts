import {GeneratePawnAttackTables} from "../pieces/pawn";
import {GenerateKingAttackTables} from "../pieces/king";
import {GenerateKnightAttackTables} from "../pieces/knight";
import {GenerateBishopAttackTables} from "../pieces/bishop";
import {GenerateRookAttackTables} from "../pieces/rook";
import {GenerateLines} from "../bitboard/consts";
import {GenerateZobristRandoms} from "../positions/init";

export function StartChessEngine() {
    GeneratePawnAttackTables()
    GenerateKingAttackTables()
    GenerateKnightAttackTables()
    GenerateBishopAttackTables()
    GenerateRookAttackTables()
    GenerateLines()
    GenerateZobristRandoms()
}