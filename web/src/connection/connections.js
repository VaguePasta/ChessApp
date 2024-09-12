export const server = import.meta.env.VITE_URL
export let SessionID = null

export function SetSessionID(id) {
    SessionID = id
}

export async function ConnectToServer() {
    let res = await fetch(server + 'auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams ({
            'type': 'login',
        })
    })
    if (res.ok) SetSessionID(await res.text())
}