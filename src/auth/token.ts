import crypto = require('crypto');
export function GenerateRandomToken(length: number) {
    return crypto.randomBytes(length).toString('hex');
}