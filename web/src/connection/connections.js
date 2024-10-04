export const server = import.meta.env.VITE_URL
export let SessionID = null

export function SetSessionID(id) {
    SessionID = id
}
export let User = null
export function SetUser(info) {
    User = {
        username: info[0],
        win: info[1],
        draw: info[2],
        loss: info[3],
        joined: info[4]
    }
}

export async function ConnectToServer(fetchInfo) {
    SetSessionID(null)
    let res = await fetch(server + 'auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: "same-origin",
        body: new URLSearchParams ({
            'type': 'login',
        })
    })
    if (res.ok) {
        SetSessionID(await res.text())
        if (fetchInfo) await GetAccountInfo()
    }
}
export async function GetAccountInfo() {
    let res = await fetch(server + 'user', {
        method: 'GET',
        headers: {
            'Authorization': SessionID
        },
        credentials: 'omit'
    })
    if (res.ok) {
        let info = JSON.parse(await res.text())
        SetUser(info)
    }
}