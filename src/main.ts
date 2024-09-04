import express = require('express')
import {GenerateRandomToken} from "./auth/token";
import {StartChessEngine} from "./game/engine/engine";
export const app = express()
import cors from 'cors';
import {WebSocketServer} from "ws";
import http = require('http')
import {Matches, NewMatch, PlayMove} from "./match/match";
import {GenerateMoves} from "./game/moves/movegen";
import {FENStart, PrintGameState} from "./game/engine/game";
import {ExecuteMove, PrintMove} from "./game/moves/move";
app.use([
    express.text({
        type: "text/plain",
    }),
    express.json({
        type: "application/json",
    }),
    express.urlencoded({
        type: "application/x-www-form-urlencoded",
    }),
    cors()
])
app.post('/new', (_, res) => {
    token = GenerateRandomToken()
    res.end(JSON.stringify([token + "1", FENStart]))
})
let token: string
export const server = http.createServer(app)
server.listen(8080,() => {
    console.log("Starting chess engine....")
    StartChessEngine()
    console.log('Server started. Listening on 8080.')
})
export const wss = new WebSocketServer({
    noServer: true,
})
wss.on('connection', (ws) => {
    if (NewMatch(token, FENStart, ws)) {
        // @ts-ignore
        // let game = Matches.get(token).Game
        // game.LegalMoveList = GenerateMoves(game.GameInfo)
        // ws.send(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count))
        // ws.on('message', (data: any) => {
        //     // @ts-ignore
        //     PlayMove(parseInt(data), Matches.get(token).Game, ws)
        // })
        let game = Matches.get(token).Game
        ws.on('message', (data: any) => {
            if (data.toString() === "ok") {
                setTimeout(() => {
                    console.log("Client ready.")
                    game.LegalMoveList = GenerateMoves(game.GameInfo)
                    let startmove = game.LegalMoveList.moves[Math.floor(Math.random() * game.LegalMoveList.count)]
                    ws.send(new Uint16Array([startmove]).buffer)
                    game.GameInfo = ExecuteMove(game.GameInfo, startmove)
                    game.LegalMoveList = GenerateMoves(game.GameInfo)
                    ws.send(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count))
                    ws.on('message', (data: any) => {
                        // @ts-ignore
                        PlayMove(parseInt(data), Matches.get(token).Game, ws)
                    })
                }, 2000)
            }
        })
        ws.on('close',() => {
            Matches.delete(token)
            token = ""
        })
    }
})
server.on('upgrade', function upgrade(request, socket, head) {
    if (request.url !== undefined && request.url.slice(0, -1).slice(1) === token) {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request)
        })
    }
    else {
        socket.destroy()
    }
})