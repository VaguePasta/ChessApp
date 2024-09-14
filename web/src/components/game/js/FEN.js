export function ParseFEN(FEN) {
    let pieces = new Map();
    let counter = 0
    let pieceCount = 1
    /*
      A FEN string contains six fields:
      0: Pieces positions.
      1: Active color.
      2: Castling availability.  //Ignore
      3: En passant square.   //Ignore
      4: Half-move clock.  //Ignore
      5: Full-move clock.  //Ignore
    */
    const gameInformation = FEN.split(" ")

    for (let i = 0; i < gameInformation[0].length; i++) {
        let currentChar = gameInformation[0][i];
        if (currentChar >= '1' && currentChar <= '8') {
            counter += parseInt(currentChar)
        } else if (currentChar === 'p') {
            let pieceInfo = new Uint8Array([pieceCount, 8, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'P') {
            let pieceInfo = new Uint8Array([pieceCount, 0, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'N') {
            let pieceInfo = new Uint8Array([pieceCount, 1, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'n') {
            let pieceInfo = new Uint8Array([pieceCount, 9, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'R') {
            let pieceInfo = new Uint8Array([pieceCount, 3, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'r') {
            let pieceInfo = new Uint8Array([pieceCount, 11, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'B') {
            let pieceInfo = new Uint8Array([pieceCount, 2, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'b') {
            let pieceInfo = new Uint8Array([pieceCount, 10, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'Q') {
            let pieceInfo = new Uint8Array([pieceCount, 4, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'q') {
            let pieceInfo = new Uint8Array([pieceCount, 12, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'K') {
            let pieceInfo = new Uint8Array([pieceCount, 5, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        } else if (currentChar === 'k') {
            let pieceInfo = new Uint8Array([pieceCount, 13, counter])
            pieces.set(pieceInfo[0], {
                Piece: pieceInfo,
                Selected: false
            })
            counter++
            pieceCount++
        }
    }
    return pieces
}

export function ExtractSideToMove(FEN) {
    let information = FEN.split(" ")
    return information[1] === 'w' ? 0 : 1
}