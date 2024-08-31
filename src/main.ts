import {FENStart, Game, NewGame, PrintGameState} from "./game/game";
import {ParseFEN} from "./game/fen/parse";
import {PrintAttackedSquare} from "./game/moves/attacks";
import {Pieces, Side} from "./game/bitboard/bit_boards";
import {GenerateBishopAttackTables} from "./game/pieces/bishop";
import {GenerateRookAttackTables} from "./game/pieces/rook";
import {GenerateKingAttackTables} from "./game/pieces/king";
import {GeneratePawnPushes} from "./game/moves/pawn_pushes";
import {GenerateMoves} from "./game/moves/movegen";
import {GeneratePawnAttackTables} from "./game/pieces/pawn";
import {PrintBoard} from "./game/bitboard/bit_operations";
import {KingsideBlack, KingsideWhite, QueensideBlack, QueensideWhite} from "./game/pieces/consts";
import {GenerateKnightAttackTables} from "./game/pieces/knight";
if (require.main === module) {
    main();
}
function main() {
    const game: Game = NewGame()
    if (ParseFEN(game, "8/8/8/8/2pPp3/8/8/8 b - d3 0 1")) {
        console.log("Invalid FEN.")
    }
    else {
        GeneratePawnAttackTables()
        // GenerateKingAttackTables()
        // GenerateKnightAttackTables()
        // GenerateBishopAttackTables()
        // GenerateRookAttackTables()
        PrintGameState(game)
        GenerateMoves(game, Side.black)
    }

}