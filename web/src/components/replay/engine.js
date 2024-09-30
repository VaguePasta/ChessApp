export function ExtractCP(response) {
    let result = [0]
    let cp_index = response.indexOf("cp", 41)
    if (cp_index === -1) {
        cp_index = response.indexOf("mate", 41)
        result = [1]
    }
    let cutoff_index = response.indexOf("nodes", 45)
    result.push(parseInt(response.slice(cp_index + (result[0] ? 4 : 3), cutoff_index - 1)))
    return result
}
export function Base64ToUint16(base64) {
    let binaryString = atob(base64);
    let bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    let uint16 = new Uint16Array(bytes.length / 2)
    let counter = 0
    for (let i = 0; i < uint16.length; i++) {
        uint16[uint16.length - i - 1] = (bytes[counter] << 8) | bytes[counter + 1]
        counter += 2
    }
    return uint16
}