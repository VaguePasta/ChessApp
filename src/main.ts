import {FENStart, Game, NewGame, PrintGameState} from "./game/engine/game";
import {ParseFEN} from "./game/fen/parse";
import {GenerateBishopAttackTables} from "./game/pieces/bishop";
import {GenerateRookAttackTables} from "./game/pieces/rook";
import {GenerateKingAttackTables} from "./game/pieces/king";
import {GeneratePawnAttackTables} from "./game/pieces/pawn";
import {GenerateKnightAttackTables} from "./game/pieces/knight";
import {GenerateLineBetween, LinesBetween} from "./game/bitboard/consts";
import {GenerateMoves} from "./game/moves/movegen";
import {PrintMove} from "./game/moves/move";
import {Perft} from "./game/engine/perft";
if (require.main === module) {
    main();
}
function main() {
    const game: Game = NewGame()
    if (ParseFEN(game.GameInfo, FENStart)) {
        console.log("Invalid FEN.")
    }
    else {
        GeneratePawnAttackTables()
        GenerateKingAttackTables()
        GenerateKnightAttackTables()
        GenerateBishopAttackTables()
        GenerateRookAttackTables()
        GenerateLineBetween()
        console.log("Nodes: " + Perft(game.GameInfo, 4))
        // PrintGameState(game.GameInfo)
        // performance.mark('A')
        // game.LegalMoveList = GenerateMoves(game.GameInfo)
        // performance.mark('B')
        // performance.measure('movegen', 'A', 'B')
        // for (let i = 0; i < game.LegalMoveList.count; i++) {
        //     PrintMove(game.LegalMoveList.moves[i], game.GameInfo.SideToMove, game.GameInfo.PieceBitboards)
        // }
        // const measure = performance.getEntriesByName('movegen')[0]
        // console.log("Total " + game.LegalMoveList.count + " moves generated in " + measure.duration.toFixed(3) + " ms.")
    }

}