import {GameServer, MatchMakingServer} from "../main";
import {ConnectToLobby, Lobby, ProcessMatchmakingRequest} from "../match/matchmaking";

export function ProcessUpgrades(request: any, socket: any, head: any): boolean {
    let requestData = request.url.slice(1).split("/")
    if (requestData[0] === "match") {
        MatchMakingServer.handleUpgrade(request, socket, head, (ws) => {
            ProcessMatchmakingRequest(ws)
        })
        return true
    }
    else if (requestData[0] === "game") {
        GameServer.handleUpgrade(request, socket, head, (ws) => {
            ConnectToLobby(ws, requestData[1])
        })
        return true
    }
    return false
}
