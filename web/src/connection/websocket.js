import {server, SessionID} from "@/connection/connections.js";

export let websocket
export function WebSocketConnect(query) {
    websocket = new WebSocket(server + "ws/" + query + "/" + SessionID)
    websocket.binaryType = "arraybuffer"
}