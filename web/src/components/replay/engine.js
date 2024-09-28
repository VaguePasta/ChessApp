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