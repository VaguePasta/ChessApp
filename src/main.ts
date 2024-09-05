import express = require('express')
import {GenerateRandomToken} from "./auth/token";
import {StartChessEngine} from "./game/engine/engine";
export const app = express()
import cors from 'cors';
import {WebSocketServer} from "ws";
import http = require('http')
import {Matches, NewMatch, PlayMove} from "./match/match";
import {GenerateMoves} from "./game/moves/movegen";
import {ExecuteMove} from "./game/moves/move";
import {Player} from "./match/player";
import {Side} from "./game/bitboard/bit_boards";
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
    res.end(JSON.stringify([token + "0", "1b2k3/6P1/8/8/2B5/8/8/3K4 w - - 0 1"]))
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
wss.on('connection', (ws: any) => {
    let player: Player = {
        Side: Side.white,
        Connection: ws,
    }
    if (NewMatch(token, "1b2k3/6P1/8/8/2B5/8/8/3K4 w - - 0 1", player)) {
        //@ts-ignore
        let game = Matches.get(token).Game
        if (player.Side === game.GameState.SideToMove) {
            ws.on('message', (data: any) => {
                if (data.toString() === "ok") {
                    game.LegalMoveList = GenerateMoves(game.GameState)
                    ws.send(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count))
                    ws.on('message', (data: any) => {
                        // @ts-ignore
                        setTimeout(() => PlayMove(parseInt(data), Matches.get(token).Game, player), 1000)
                    })
                }
            })
        }
        else {
            ws.on('message', (data: any) => {
                if (data.toString() === "ok") {
                    setTimeout(() => {
                        game.LegalMoveList = GenerateMoves(game.GameState)
                        let startmove = game.LegalMoveList.moves[Math.floor(Math.random() * game.LegalMoveList.count)]
                        ws.send(new Uint16Array([startmove]).buffer)
                        game.GameState = ExecuteMove(game.GameState, startmove)
                        game.LegalMoveList = GenerateMoves(game.GameState)
                        ws.send(game.LegalMoveList.moves.slice(0, game.LegalMoveList.count))
                        ws.on('message', (data: any) => {
                            // @ts-ignore
                            setTimeout(() => PlayMove(parseInt(data), Matches.get(token).Game, player), 1000)
                        })
                    }, 1000)
                }
            })
        }
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