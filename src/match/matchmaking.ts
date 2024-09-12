import {Matches, NewMatch, StartMatch} from "./match";
import {GenerateRandomToken} from "../auth/token";
import {FENStart} from "../game/engine/game";
import {Account, Active_sessions} from "../auth/account";

export const MatchQueue = new Array<MatchMaker>()
export interface MatchMaker {
    ws: any,
    sessionId: string
}
export interface WaitingRoom {
    Token: string
    Player1: Account | null
    Player2: Account | null
}
export const Lobby = new Map<string, WaitingRoom>()
export function ProcessMatchmakingRequest(ws: any, sessionId: string) {
    if (!Active_sessions.get(sessionId)) return false
    if (MatchQueue.length >= 1) {
        let token = GenerateRandomToken(8)
        Lobby.set(token, {
            Token: token,
            Player1: null,
            Player2: null,
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
    ws.on('exit',(lobby: WaitingRoom) => {
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
    if (lobby.Player1 === null) {
        // @ts-ignore
        lobby.Player1 = Active_sessions.get(sessionId)
        // @ts-ignore
        lobby.Player1.Websocket = ws
        return true
    }
    else {
        // @ts-ignore
        lobby.Player2 = Active_sessions.get(sessionId)
        // @ts-ignore
        lobby.Player2.Websocket = ws
        let player1Side = Math.round(Math.random())
        // @ts-ignore
        if (!NewMatch(token, FENStart, {Side: player1Side, Connection: lobby.Player1.Websocket, Username: lobby.Player1.Username, Userid: lobby.Player1.Userid}, {Side: 1 - player1Side, Connection: lobby.Player2.Websocket, Username: lobby.Player2.Username, Userid: lobby.Player2.Userid})) {
            lobby.Player1.Websocket.send("Some error happened.")
            // @ts-ignore
            lobby.Player2.Websocket.send("Some error happened.")
            lobby.Player1.Websocket.close()
            // @ts-ignore
            lobby.Player2.Websocket.close()
            Lobby.delete(token)
        }
        else {
            lobby.Player1.Websocket.send("ok")
            // @ts-ignore
            lobby.Player2.Websocket.send("ok")
            Lobby.delete(token)
            StartMatch(Matches.get(token))
        }
    }
    return true
}