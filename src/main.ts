import express = require('express')
import {ClearBit, GameMap, PrintBoard, RightShift, SetBit} from "./game/board";
import {GenerateRandomToken} from "./auth/token";
import {NewGame} from "./game/game";
import {GeneratePawnAttackTables, PawnAttackTable} from "./game/pawn";
const app = express()
app.use([
    express.text({
    type: "text/plain",
    }),
    express.json({
        type: "application/json",
    }),
    express.urlencoded({
        type: "application/x-www-form-urlencoded",
    })
])
app.post('/new', (_, res) => {
    let token: string = GenerateRandomToken()
    res.end(token)
    NewGame(token)
})
app.post('/end', (req, res) => {
    if(GameMap.delete(req.body)) {
        res.status(200).end()
    }
    else {
        res.status(404).end()
    }
})
function main() {
    GeneratePawnAttackTables()
}
app.listen(8080,() => {
    main()
    console.log('Server started. Listening on 8080.')
})