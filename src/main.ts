import express = require('express')
import {StartChessEngine} from "./game/engine/engine";
export const app = express()
import cors from 'cors';
import http = require('http')
import {ProcessUpgrades} from "./connection/websocket";
import {Divide, Perft} from "./game/engine/perft";
import {FENStart, NewGame} from "./game/engine/game";
app.use([
    express.text({
        type: "text/plain",
    }),
    express.json({
        type: "application/json",
    }),
    express.urlencoded({
        type: "application/x-www-form-urlencoded",
        extended: false,
    }),
    cors()
])
export const server = http.createServer(app)
app.post('/auth', (req, res) => {
    console.log(req.body.type)
    res.end()
})
server.listen(8080,() => {
    console.log("Starting chess engine....")
    StartChessEngine()
    console.log('Server started. Listening on 8080.')
    // let sum = 0
    //@ts-ignore
    let game = NewGame("rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8").GameState
    Divide(game, 4)
    // for (let i = 0; i < 10000; i++) {
    //     performance.mark('A')
    //     Perft(game, 1)
    //     performance.mark('B')
    //     performance.measure('movegen', 'A', 'B')
    //     const measure = performance.getEntriesByName('movegen')[0]
    //     sum += measure.duration
    // }
    // console.log("Average: " + (sum/10000).toFixed(3) + " ms.")
})
server.on('upgrade', function upgrade(request, socket, head) {
    if (!ProcessUpgrades(request, socket, head))
        socket.destroy()
})