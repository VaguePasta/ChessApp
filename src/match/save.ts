import LZString from 'lz-string';

export function CompressMatch(value: bigint) {
    const bytes = [];
    while (value > 0n) {
        bytes.unshift(Number(value & 0xffn));
        value >>= 8n;
    }
    return LZString.compress(btoa(String.fromCharCode.apply(null, bytes)))
}