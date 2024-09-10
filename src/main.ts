import express = require('express')
import {StartChessEngine} from "./game/engine/engine";
export const app = express()
import cors from 'cors';
import http = require('http')
import {ProcessUpgrades} from "./connection/websocket";
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
    res.end()
})
server.listen(8080,() => {
    console.log("Starting chess engine....")
    StartChessEngine()
    console.log('Server started. Listening on 8080.')
})
server.on('upgrade', function upgrade(request, socket, head) {
    if (!ProcessUpgrades(request, socket, head))
        socket.destroy()
})