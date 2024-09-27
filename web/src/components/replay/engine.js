export function ExtractCP(response) {
    let result = [0]
    let cp_index = response.indexOf("cp", 41)
    if (cp_index === -1) {
        cp_index = response.indexOf("mate", 41)
        result = [1]
    }
    let wdl_index = response.indexOf("wdl", 45)
    let cutoff_index = response.indexOf("nodes", 55) - 1
    result.push(Number(response.slice(cp_index + (result[0] ? 4 : 3), wdl_index - 1)))
    result.push(response.slice(wdl_index + 4, cutoff_index).split(" ").map(Number))
    return result
}