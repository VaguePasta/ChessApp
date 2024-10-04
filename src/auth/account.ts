import {DatabaseConn} from "../database/init";
import bcrypt from 'bcrypt';
import {GenerateRandomToken} from "./token";
import {createHash} from "node:crypto";
const saltRounds = 11
export async function ManualLogin(username: string, password: string, remember: string): Promise<string[] | null> {
    if (!username || !password || !remember) return null
    const user = await DatabaseConn`select user_id, username, password from users where username=${username}`
    if (user.count === 0) return null
    if (!await bcrypt.compare(password, user[0].password)) return null
    let token: string = GenerateRandomToken(8)
    while(Active_sessions.get(token) !== undefined) {
        token = GenerateRandomToken(8)
    }
    Active_sessions.set(token, {
        Userid: user[0].user_id,
        Username: user[0].username,
        Token: token,
        Websocket: null,
        LastUsed: Date.now()
    })
    if (remember === "false") return [token]
    let selector: string = GenerateRandomToken(12), validator: string = GenerateRandomToken(12)
    const hashedValidator = createHash('sha256').update(validator).digest('base64')
    const insert = await DatabaseConn`insert into auth_tokens values(${selector}, ${hashedValidator}, ${user[0].user_id}, (select localtimestamp(0) + interval '15 days'))`
    if (insert.count === 0) return null
    return [token, selector.concat(validator)]
}
export async function AutoLogin(verification: string): Promise<string|null> {
    const selector = verification.slice(0, 24)
    const validator = verification.slice(24)
    const row = await DatabaseConn`select selector, hashed_validator, users.user_id, expires, username from current_auth_tokens inner join users on current_auth_tokens.user_id = users.user_id where selector=${selector}`
    if (row.count === 0) {
        return null
    }
    const hashedValidator = createHash('sha256').update(validator).digest('base64')
    if (hashedValidator !== row[0].hashed_validator) return null
    let token: string = GenerateRandomToken(8)
    while(Active_sessions.get(token) !== undefined) {
        token = GenerateRandomToken(8)
    }
    Active_sessions.set(token, {
        Userid: row[0].user_id,
        Username: row[0].username,
        Token: token,
        Websocket: null,
        LastUsed: Date.now(),
    })
    return token
}
export async function Register(username: string, password: string): Promise<boolean> {
    let hashedPassword = await bcrypt.hash(password, saltRounds)
    const result = await DatabaseConn`insert into users (username, password, join_date) values (${username}, ${hashedPassword}, (select current_date)) on conflict do nothing`
    return result.count !== 0;
}
export async function LogOut(verification: string): Promise<boolean> {
    if (!verification) return false
    const result = await DatabaseConn`delete from auth_tokens where selector=${verification.slice(0, 24)}`
    return result.count !== 0;
}
export async function GetUser(token: string): Promise<string|null> {
    let user = Active_sessions.get(token)
    if (!user) {
        return null
    }
    else {
        let data = await DatabaseConn`select win, draw, loss, join_date from users where user_id=${user.Userid}`
        return JSON.stringify([user.Username, data[0].win, data[0].draw, data[0].loss, data[0].join_date])
    }
}
export interface Account {
    Userid: number,
    Username: string,
    Token: string,
    Websocket: any,
    LastUsed: number
}
setInterval(() => {
    let current_time = Date.now()
    Active_sessions.forEach((value) => {
        if (current_time - value.LastUsed >= 300000) Active_sessions.delete(value.Token)
    })
}, 90000)
export const Active_sessions = new Map<string, Account>()