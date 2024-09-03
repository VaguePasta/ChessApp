export let websocket: WebSocket
export let gameToken: string = ""
export const server = import.meta.env.VITE_URL
export function setGameToken(token) {
    gameToken = token
}
export function WebSocketConnect(token): boolean {
    websocket = new WebSocket(server + token)
    websocket.binaryType = "arraybuffer"
}