export let websocket: WebSocket
export const server = import.meta.env.VITE_URL
export function WebSocketConnect(query): boolean {
    websocket = new WebSocket(server + query)
    websocket.binaryType = "arraybuffer"
}