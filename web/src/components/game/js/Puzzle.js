import {ConnectToServer, server, SessionID} from "@/connection/connections.js";
import {router} from "@/main.js";

export function PlayPuzzle() {
    fetch(server + "puzzle", {
        method: "GET",
        headers: {
            'Authorization': SessionID,
        },
        credentials: 'omit'
    }).then(res => {
        if (!res.ok) {
            ConnectToServer().then(async () => {
                if (!SessionID) await router.push("/")
                else PlayPuzzle()
            })
        }
        else {
            res.json().then(async (json) => {
                await router.push({
                    path: "/puzzle",
                    query: {f: btoa(json.fen), m: btoa(json.moves), r: json.rating}
                })
            })
        }
    })
}