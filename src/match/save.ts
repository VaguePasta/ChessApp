import LZString from 'lz-string';

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