import {StartOnlineMatch} from "./online_match";
import {GenerateRandomToken} from "../auth/token";
import {FENStart} from "../game/engine/game";
import {Account, Active_sessions} from "../auth/account";
import {CustomWebSocket} from "../connection/websocket";
import {Matches, NewMatch} from "./match";

export const MatchQueue = new Array<MatchMaker>()
export interface MatchMaker {
    ws: any,
    sessionId: string
}
export interface WaitingRoom {
    Token: string
    Player1: Account | undefined
    Player2: Account | undefined
}
export const Lobby = new Map<string, WaitingRoom>()
export function ProcessMatchmakingRequest(ws: any, sessionId: string) {
    if (!Active_sessions.get(sessionId)) return false
    if (MatchQueue.length >= 1) {
        let token = GenerateRandomToken(8)
        Lobby.set(token, {
            Token: token,
            Player1: undefined,
            Player2: undefined,
        })
        MatchQueue[0].ws.send(token)
        MatchQueue[0].ws.on('message', (data: any) => {
            if (data.toString() === "Refused.") {
                let lobby = Lobby.get(token)
                if (lobby) {
                    if (lobby.Player1) {
                        lobby.Player1.Websocket.send("Match cancelled.")
                        lobby.Player1.Websocket.close()
                        ws.close()
                    }
                    else if (lobby.Player2) {
                        lobby.Player2.Websocket.send("Match cancelled.")
                        lobby.Player2.Websocket.close()
                        ws.close()
                    }
                    Lobby.delete(token)
                }
            }
        })
        MatchQueue.shift()
        ws.send(token)
        ws.on('message', (data: any) => {
            if (data.toString() === "Refused.") {
                let lobby = Lobby.get(token)
                if (lobby) {
                    if (lobby.Player1) {
                        lobby.Player1.Websocket.send("Match cancelled.")
                        lobby.Player1.Websocket.close()
                        ws.close()
                    }
                    else if (lobby.Player2) {
                        lobby.Player2.Websocket.send("Match cancelled.")
                        lobby.Player2.Websocket.close()
                        ws.close()
                    }
                    Lobby.delete(token)
                }
            }
        })
    }
    else {
        MatchQueue.push({
            ws: ws,
            sessionId: sessionId
        })
        ws.on('quit', (ws: any) => {
            MatchQueue.forEach((value, index) => {
                if (value.ws === ws) {
                    MatchQueue.splice(index, 1)
                }
            })
        })
        ws.on('close', () => {
            ws.emit('quit', ws)
        })
    }
    return true
}
export function ConnectToLobby(ws: any, token: any, sessionId: string): boolean {
    if (!Active_sessions.get(sessionId)) return false
    let lobby = Lobby.get(token)
    if (lobby === undefined) {
        ws.send("Match cancelled.")
        ws.close()
        return true
    }
    ws.on('exit', (lobby: WaitingRoom) => {
        if (lobby.Player1) {
            lobby.Player1.Websocket.send("Match cancelled.")
            lobby.Player1.Websocket.close()
        }
        if (lobby.Player2) {
            lobby.Player2.Websocket.send("Match cancelled.")
            lobby.Player2.Websocket.close()
        }
        Lobby.delete(lobby.Token)
    })
    ws.on('close', () => {
        ws.emit('exit', lobby)
    })
    if (lobby === undefined) {
        ws.close()
        return true
    }
    if (lobby.Player1 === undefined) {
        lobby.Player1 = Active_sessions.get(sessionId)
        if (!lobby.Player1) return false
        lobby.Player1.Websocket = ws
        return true
    }
    else if (lobby.Player2 === undefined) {
        lobby.Player2 = Active_sessions.get(sessionId)
        if (!lobby.Player2) return false
        lobby.Player2.Websocket = ws
        let player1Side = Math.round(Math.random())
        if (!NewMatch(token, FENStart, {Side: player1Side, Connection: lobby.Player1.Websocket, Username: lobby.Player1.Username, Userid: lobby.Player1.Userid.toString()}, {Side: 1 - player1Side, Connection: lobby.Player2.Websocket, Username: lobby.Player2.Username, Userid: lobby.Player2.Userid.toString()})) {
            lobby.Player1.Websocket.send("Some error happened.")
            lobby.Player2.Websocket.send("Some error happened.")
            lobby.Player1.Websocket.close()
            lobby.Player2.Websocket.close()
            Lobby.delete(token)
        }
        else {
            lobby.Player1.Websocket.send("ok")
            lobby.Player2.Websocket.send("ok")
            Lobby.delete(token)
            lobby.Player1.Websocket.removeAllListeners()
            lobby.Player2.Websocket.removeAllListeners()
            lobby.Player1.Websocket.on('pong', () => {
                // @ts-ignore
                lobby.Player1.Websocket.emit('alive', lobby.Player1.Websocket)
            })
            lobby.Player1.Websocket.on('alive', (ws: CustomWebSocket) => {
                ws.isAlive = true
            })
            lobby.Player2.Websocket.on('pong', () => {
                // @ts-ignore
                lobby.Player2.Websocket.emit('alive', lobby.Player2.Websocket)
            })
            lobby.Player2.Websocket.on('alive', (ws: CustomWebSocket) => {
                ws.isAlive = true
            })
            StartOnlineMatch(Matches.get(token))
        }
    }
    return true
}