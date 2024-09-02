export let websocket: WebSocket
export const server = import.meta.env.VITE_URL
export function WebSocketConnect(token: string) {
    websocket = new WebSocket("ws://" + server.slice(server.indexOf("//") + 2) + "ws/" + token)
}