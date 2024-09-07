import {Matches, NewMatch, StartMatch} from "./match";
import {GenerateRandomToken} from "../auth/token";
import {FENStart} from "../game/engine/game";

export const MatchQueue = new Array<MatchMaker>()
export interface MatchMaker {
    ws: any,
}
export interface WaitingRoom {
    Token: string
    Player1: any
    Player2: any
}
export const Lobby = new Map<string, WaitingRoom>()
export function ProcessMatchmakingRequest(ws: any) {
    if (MatchQueue.length >= 1) {
        let token = GenerateRandomToken()
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
                        lobby.Player1.send("Match cancelled.")
                        ws.close()
                    }
                    else if (lobby.Player2) {
                        lobby.Player1.send("Match cancelled.")
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
                        lobby.Player1.send("Match cancelled.")
                        ws.close()
                    }
                    else if (lobby.Player2) {
                        lobby.Player1.send("Match cancelled.")
                        ws.close()
                    }
                    Lobby.delete(token)
                }
            }
        })
    }
    else {
        MatchQueue.push({
            ws: ws
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
}
export function ConnectToLobby(ws: any, token: any): void {
    let lobby = Lobby.get(token)
    if (lobby === undefined) {
        ws.send("Match cancelled.")
        ws.close()
        return
    }
    ws.on('exit',(lobby: WaitingRoom) => {
        if (lobby.Player1) {
            lobby.Player1.send("Match cancelled.")
            lobby.Player1.close()
        }
        if (lobby.Player2) {
            lobby.Player2.send("Match cancelled.")
            lobby.Player2.close()
        }
        Lobby.delete(lobby.Token)
    })
    ws.on('close', () => {
        ws.emit('exit', lobby)
    })
    if (lobby === undefined) {
        ws.close()
        return
    }
    if (lobby.Player1 === null) {
        lobby.Player1 = ws
        return
    }
    else {
        lobby.Player2 = ws
        let player1Side = Math.round(Math.random())
        if (!NewMatch(token, FENStart, {Side: player1Side, Connection: lobby.Player1}, {Side: 1 - player1Side, Connection: lobby.Player2})) {
            lobby.Player1.send("Some error happened.")
            lobby.Player2.send("Some error happened.")
            lobby.Player1.close()
            lobby.Player2.close()
            Lobby.delete(token)
        }
        else {
            lobby.Player1.send("ok")
            lobby.Player2.send("ok")
            Lobby.delete(token)
            StartMatch(Matches.get(token))
        }
    }
}