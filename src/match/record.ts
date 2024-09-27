import LZString from 'lz-string';
import {DatabaseConn} from "../database/init";
import {Active_sessions} from "../auth/account";

export function CompressMatch(value: bigint) {
    const bytes = [];
    while (value > 0n) {
        bytes.unshift(Number(value & 0xffn));
        value >>= 8n;
    }
    return LZString.compressToUTF16(btoa(String.fromCharCode.apply(null, bytes)))
}

export function DecompressMatch(compressed: string): string {
    return LZString.decompressFromUTF16(compressed)
}
interface Game_records {
    game_id : number
    white_player: string
    black_player: string
    win_side: string
}
export async function GetRecordList(userid: number) {
    let result = await DatabaseConn`select game_id, white.username as white_player, black.username as black_player, win_side from game_records as game left join users as white on white_player = white.user_id  left join users as black on black_player = black.user_id where game.white_player = ${userid} or game.black_player = ${userid}`
    let response = Array<Game_records>(result.count)
    result.forEach((_, index) => {
        response[index] = {
            game_id: result[index].game_id,
            white_player: result[index].white_player,
            black_player: result[index].black_player,
            win_side: result[index].win_side
        }
    })
    return JSON.stringify(response)
}

export async function GetRecord(sessionID: string | undefined, id: string) {
    if (!sessionID) return null
    let requester = Active_sessions.get(sessionID)
    if (!requester) return null
    requester.LastUsed = Date.now()
    let moves = await DatabaseConn`select moves from game_records where game_id = ${id} and(white_player = ${requester.Userid} or black_player = ${requester.Userid})`
    if (!moves.count) return null
    return DecompressMatch(moves[0].moves.toString())
}