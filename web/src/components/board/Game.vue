<script setup lang="ts">
  import Piece from "@/components/board/Piece.vue";
  enum PieceType {
    None = 0,  // 0000
    King = 1,  // 0001
    Pawn = 2,  // 0010
    Knight = 3,// 0011
    Bishop = 4,// 0100
    Rook = 5,  // 0101
    Queen = 6, // 0110

    White = 8, // 1000
    Black = 16,// 10000
  }
  enum algebraicRemainder {
    a = 0,
    b = 1,
    c = 2,
    d = 3,
    e = 4,
    f = 5,
    g = 6,
    h = 7,
  }
  function AlgebraicToIndex(algebraic: string): number {
    let file = algebraic[0]   //File: Column a-h
    let rank = parseInt(algebraic[1])   //Rank: Row 1-8
    switch (file) {
      case 'a':
        return algebraicRemainder.a + 8 * (8 - rank)
      case 'b':
        return algebraicRemainder.b + 8 * (8 - rank)
      case 'c':
        return algebraicRemainder.c + 8 * (8 - rank)
      case 'd':
        return algebraicRemainder.d + 8 * (8 - rank)
      case 'e':
        return algebraicRemainder.e + 8 * (8 - rank)
      case 'f':
        return algebraicRemainder.f + 8 * (8 - rank)
      case 'g':
        return algebraicRemainder.g + 8 * (8 - rank)
      case 'h':
        return algebraicRemainder.h + 8 * (8 - rank)
    }
  }
  function IndexToAlgebraic(index: number): string {
    return 'abcdefgh'.charAt(index % 8) + (8 - Math.floor(index/8))
  }
  interface Piece {
    PieceInfos: Int8Array;
    /*
    The piece's information is stored in 2 elements:
      The first element represent the information of the piece, with the 3 least significant bits denote the type, and the remaining bit denote the color.
      The 6 least significant bits of the second element represent the position of the piece, the most significant bit represent castling right, and the remaining bit represent the possibility of an en passant capture.
     */
    LegalMoves: Int16Array;
    /*
      A legal move is encoded in a 16-bit integer:
        _________________________________________________________________
        | x | x | x | x | x | x | x | x | x | x | x | x | x | x | x | x |
        |_______________________|_______________________|___|___________|
                    ↓                       ↓             ↓       ↓
             Initial square           Target square   Promotion  (1)

        If the promotion bit is 0, the 3 bits of (1) encode capturing move:
          000: No capture.
          001: Captured a pawn.
          010: Captured a knight.
          011: Captured a bishop.
          100: Captured a rook.
          101: Captured a queen.
        If the promotion bit is 1, it instead encodes the type of piece the pawn is promoted to:
          000: Queen.
          001: Knight.
          010: Bishop.
          011: Rook.
     */
  }
  const pieces = new Array<Piece>();
  parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
  function parseFEN(FEN: string) {
    /*
      A FEN string contains six fields:
      0: Pieces positions.
      1: Active color.
      2: Castling availability.
      3: En passant square.
      4: Half-move clock.
      5: Full-move clock.
    */
    const gameInformation = FEN.split(" ")
    let counter: number = 0
    for (let i = 0; i < gameInformation[0].length; i++) {
      let currentChar = gameInformation[0][i];
      if (currentChar >= '1' && currentChar <= '8') {
        counter+=parseInt(currentChar)
      }
      else if (currentChar === 'p') {
        let enPassant: number = 0
        if (gameInformation[3] !== "-") {
          if (AlgebraicToIndex(gameInformation[3]) - 8 === counter) {
            enPassant = 1
          }
        }
        pieces.push({
          PieceInfos: new Int8Array([PieceType.Pawn + PieceType.Black, (enPassant << 7) + counter]),
          LegalMoves: new Int16Array()
        })
        counter++
      }
      else if (currentChar === 'P') {
        let enPassant: number = 0
        if (gameInformation[3] !== "-") {
          if (AlgebraicToIndex(gameInformation[3]) + 8 === counter) {
            enPassant = 1
          }
        }
        pieces.push({
          PieceInfos: new Int8Array([PieceType.Pawn + PieceType.White, (enPassant << 7) + counter]),
          LegalMoves: new Int16Array()
        })
        counter++
      }
      else if (currentChar === 'N') {
        pieces.push({
          PieceInfos: new Int8Array([PieceType.Knight + PieceType.White, counter]),
          LegalMoves: new Int16Array()
        })
        counter++
      }
      else if (currentChar === 'n') {
        pieces.push({
          PieceInfos: new Int8Array([PieceType.Knight + PieceType.Black, counter]),
          LegalMoves: new Int16Array()
        })
        counter++
      }
      else if (currentChar === 'R') {
        pieces.push({
          PieceInfos: new Int8Array([PieceType.Rook + PieceType.White, counter]),
          LegalMoves: new Int16Array()
        })
        counter++
      }
      else if (currentChar === 'r') {
        pieces.push({
          PieceInfos: new Int8Array([PieceType.Rook + PieceType.Black, counter]),
          LegalMoves: new Int16Array()
        })
        counter++
      }
      else if (currentChar === 'B') {
        pieces.push({
          PieceInfos: new Int8Array([PieceType.Bishop + PieceType.White, counter]),
          LegalMoves: new Int16Array()
        })
        counter++
      }
      else if (currentChar === 'b') {
        pieces.push({
          PieceInfos: new Int8Array([PieceType.Bishop + PieceType.Black, counter]),
          LegalMoves: new Int16Array()
        })
        counter++
      }
      else if (currentChar === 'Q') {
        pieces.push({
          PieceInfos: new Int8Array([PieceType.Queen + PieceType.White, counter]),
          LegalMoves: new Int16Array()
        })
        counter++
      }
      else if (currentChar === 'q') {
        pieces.push({
          PieceInfos: new Int8Array([PieceType.Queen + PieceType.Black, counter]),
          LegalMoves: new Int16Array()
        })
        counter++
      }
      else if (currentChar === 'K') {
        pieces.push({
          PieceInfos: new Int8Array([PieceType.King + PieceType.White, counter]),
          LegalMoves: new Int16Array()
        })
        counter++
      }
      else if (currentChar === 'k') {
        pieces.push({
          PieceInfos: new Int8Array([PieceType.King + PieceType.Black, counter]),
          LegalMoves: new Int16Array()
        })
        counter++
      }
    }
  }
</script>

<template>
  <div class="board">
      <Piece v-for="piece in pieces" :information="piece" :key="piece.PieceInfos[1]"/>
  </div>
</template>

<style scoped>
.board {
  background-image: url("@/assets/board/board.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  aspect-ratio: 1/1;
  height: 90vh;
  position: absolute;
}
</style>