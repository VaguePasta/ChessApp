import {WebSocketServer, WebSocket } from 'ws'
import {ConnectToLobby, ProcessMatchmakingRequest} from "../match/matchmaking";
export class CustomWebSocket extends WebSocket {
    isAlive: boolean | undefined
}
export class CustomWebsocketServer extends WebSocketServer<typeof CustomWebSocket> {
    constructor() {
        super({
            noServer: true,
            WebSocket: CustomWebSocket,
        })
    }
}
export const GameServer = new CustomWebsocketServer()
export const MatchMakingServer = new CustomWebsocketServer()
export function ProcessUpgrades(request: any, socket: any, head: any): boolean {
    let requestData = request.url.slice(1).split("/")
    if (requestData[0] === "match") {
        MatchMakingServer.handleUpgrade(request, socket, head, (ws) => {
            ProcessMatchmakingRequest(ws)
            MatchMakingServer.emit('connection', ws)
        })
        return true
    }
    else if (requestData[0] === "game") {
        GameServer.handleUpgrade(request, socket, head, (ws) => {
            ConnectToLobby(ws, requestData[1])
            GameServer.emit('connection', ws)
        })
        return true
    }
    return false
}

GameServer.on('connection', (ws) => {
    ws.isAlive = true
    ws.on('pong', () => {
        // @ts-ignore
        this.isAlive = true
    })
})
setInterval(() => {
    GameServer.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate()
        ws.isAlive = false
        ws.ping(null, undefined)
    })
}, 15000)
setInterval(() => {
    MatchMakingServer.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate()
        ws.isAlive = false
        ws.ping(null, undefined)
    })
}, 20000)
MatchMakingServer.on('connection', (ws) => {
    ws.isAlive = true
    ws.on('pong', () => {
        ws.emit('alive', ws)
    })
    ws.on('alive', (ws) => {
        ws.isAlive = true
    })
})
GameServer.on('connection', (ws) => {
    ws.isAlive = true
    ws.on('pong', () => {
        ws.emit('alive', ws)
    })
    ws.on('alive', (ws) => {
        ws.isAlive = true
    })
})