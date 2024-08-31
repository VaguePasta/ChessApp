import {FENStart, Game, NewGame, PrintGameState} from "./game/game";
import {ParseFEN} from "./game/fen/parse";
import {Side} from "./game/bitboard/bit_boards";
import {GenerateBishopAttackTables} from "./game/pieces/bishop";
import {GenerateRookAttackTables} from "./game/pieces/rook";
import {GenerateKingAttackTables} from "./game/pieces/king";
import {GenerateMoves} from "./game/moves/movegen";
import {GeneratePawnAttackTables} from "./game/pieces/pawn";
import {GenerateKnightAttackTables} from "./game/pieces/knight";
if (require.main === module) {
    main();
}
function main() {
    const game: Game = NewGame()
    if (ParseFEN(game, "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1")) {
        console.log("Invalid FEN.")
    }
    else {
        GeneratePawnAttackTables()
        GenerateKingAttackTables()
        GenerateKnightAttackTables()
        GenerateBishopAttackTables()
        GenerateRookAttackTables()
        PrintGameState(game)
        GenerateMoves(game, Side.white)
    }

}