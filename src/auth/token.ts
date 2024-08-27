import crypto = require('crypto');
export function GenerateRandomToken() {
    return crypto.randomBytes(8).toString('hex');
}