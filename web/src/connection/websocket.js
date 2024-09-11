import {server} from "@/connection/connections.js";

export let websocket
export function WebSocketConnect(query) {
    websocket = new WebSocket(server + query)
    websocket.binaryType = "arraybuffer"
}