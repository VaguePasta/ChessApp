import express = require('express')
import {StartChessEngine} from "./game/engine/engine";
export const app = express()
import http = require('http')
import {ProcessUpgrades} from "./connection/websocket";
import {Active_sessions, AutoLogin, GetUser, LogOut, ManualLogin, Register} from "./auth/account";
import cookie_parser from 'cookie-parser';
import {GetRecord, GetRecordList} from "./match/record";
import {GetPuzzle} from "./match/puzzle";
app.use([
    express.text({
        type: "text/plain",
    }),
    express.json({
        type: "application/json",
    }),
    express.urlencoded({
        type: "application/x-www-form-urlencoded",
        extended: false,
    }),
    cookie_parser(),
])
export const server = http.createServer(app)
app.post('/auth', (req, res) => {
    switch (req.body.type) {
        case 'login':
            if (!req.cookies['verify']) {
                ManualLogin(req.body.username, req.body.password, req.body.remember).then((result) => {
                    if (result) {
                        if (req.body.remember === "true") {
                            res.cookie("verify", result[1], {maxAge: 1296000000, httpOnly: true, sameSite:"strict"})
                        }
                        res.end(result[0])
                    } else {
                        res.status(401)
                        res.end()
                    }
                })
            }
            else {
                AutoLogin(req.cookies['verify']).then((result) => {
                    if (result) {
                        res.end(result)
                    }
                    else {
                        res.status(401).clearCookie('verify')
                        res.end()
                    }
                })
            }
            break
        case 'register':
            Register(req.body.username, req.body.password).then((result) => {
                if (!result) res.status(401)
                res.end()
            })
    }
})
app.post('/logout', (req, res) => {
    LogOut(req.cookies['verify']).then((result) => {
        if (!result) {
            Active_sessions.delete(req.body)
            res.status(200)
        }
        else {
            Active_sessions.delete(req.body)
            res.status(200).clearCookie('verify')
        }
        res.end()
    })
})
app.get('/records', (req, res) => {
    let token = req.header('authorization')
    if (!token) {
        res.status(401)
        res.end()
        return
    }
    let user = Active_sessions.get(token)
    if (!user) {
        res.status(401)
        res.end()
        return
    }
    GetRecordList(user.Userid).then((result) => {
        if (!result) {
            res.status(404)
            res.end()
        }
        else {
            user.LastUsed = Date.now()
            res.end(result)
        }
    })
})
app.get('/record/:id', (req, res) => {
    GetRecord(req.header('authorization'), req.url.split("/")[2]).then((result) => {
        if (!result) {
            res.status(401)
            res.end()
        }
        else res.end(result)
    })
})
app.get('/user', (req, res) => {
    let token = req.header('authorization')
    if (!token) {
        res.status(401)
        res.end()
        return
    }
    GetUser(token).then(result => {
        if (!result) {
            res.status(401)
            res.end()
            return
        }
        res.end(result)
    })
})
app.get("/puzzle", (req, res) => {
    GetPuzzle(req).then((puzzle: string | null) => {
        if (!puzzle) {
            res.status(401)
            res.end()
            return
        } else res.end(puzzle)
    })
})
server.listen(8080, async () => {
    StartChessEngine()
    console.log('Server started. Listening on 8080.')
})

server.on('upgrade', function upgrade(request, socket, head) {
    ProcessUpgrades(request, socket, head)
})