import {FENStart, Game, NewGame, PrintGameState} from "./game/engine/game";
import {ParseFEN} from "./game/fen/parse";
import {GenerateBishopAttackTables} from "./game/pieces/bishop";
import {GenerateRookAttackTables} from "./game/pieces/rook";
import {GenerateKingAttackTables} from "./game/pieces/king";
import {GeneratePawnAttackTables} from "./game/pieces/pawn";
import {GenerateKnightAttackTables} from "./game/pieces/knight";
import {GenerateLineBetween, LinesBetween} from "./game/bitboard/consts";
import {Divide, Perft} from "./game/engine/perft";
import {ExecuteMove, GetMoveFlag, GetMoveSource, GetMoveTarget, MoveFlags, PrintMove} from "./game/moves/move";
import {GenerateMoves} from "./game/moves/movegen";
import {PrintBoard} from "./game/bitboard/bit_operations";
import {Pieces, Side} from "./game/bitboard/bit_boards";
if (require.main === module) {
    main();
}
function main() {
    const game: Game = NewGame()
    if (ParseFEN(game.GameInfo, "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8")) {
        console.log("Invalid FEN.")
    }
    else {
        GeneratePawnAttackTables()
        GenerateKingAttackTables()
        GenerateKnightAttackTables()
        GenerateBishopAttackTables()
        GenerateRookAttackTables()
        GenerateLineBetween()
        PrintGameState(game.GameInfo)
        performance.mark('A')
        game.LegalMoveList = GenerateMoves(game.GameInfo)
        performance.mark('B')
        performance.measure('movegen', 'A', 'B')
        const measure = performance.getEntriesByName('movegen')[0]
        console.log("Total " + game.LegalMoveList.count + " moves generated in " + measure.duration.toFixed(3) + " ms.")



    }
}