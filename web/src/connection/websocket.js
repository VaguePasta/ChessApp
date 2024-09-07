export let websocket
export const server = import.meta.env.VITE_URL
export function WebSocketConnect(query) {
    websocket = new WebSocket(server + query)
    websocket.binaryType = "arraybuffer"
}