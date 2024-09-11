export const server = import.meta.env.VITE_URL
export let SessionID = null

export function SetSessionID(id) {
    SessionID = id
}