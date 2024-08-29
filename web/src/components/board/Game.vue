<script setup lang="ts">
  import Piece from "./Piece.vue";
  import {ref} from "vue";
  import {ParseFEN} from "./FEN.ts";
  import {PopulateOccupiedBoards} from "./Bitboards.ts";
  import {IndexToAlgebraic} from "./Notation.ts";
  const side = defineProps(['side'])
  let selectingPiece = ref(0)
  const pieces: any = ref(ParseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"));
  //White, black
  const occupiedBoard = ref(PopulateOccupiedBoards(pieces.value))
  function MoveIsLegal(): boolean {
    return true
  }
  function SelectingPiece(event: any, pieceNumber: number) {
    if (!selectingPiece.value) {
      selectingPiece.value = pieceNumber
      pieces.value.get(pieceNumber).Selected = true
      event.preventDefault()
      event.stopPropagation()
    }
    else {
      if (pieceNumber === selectingPiece.value) {
        pieces.value.get(pieceNumber).Selected = false
        selectingPiece.value = 0
        event.preventDefault()
        event.stopPropagation()
      }
      else {
        pieces.value.get(selectingPiece.value).Selected = false
        selectingPiece.value = pieceNumber
        pieces.value.get(pieceNumber).Selected = true
        event.preventDefault()
        event.stopPropagation()
      }
    }
  }
  function MovePiece(event: any) {
    if (selectingPiece.value !== 0) {
      // console.log("Moved from: " + IndexToAlgebraic(pieces.value.get(selectingPiece.value).PieceInfos[1] & 0b00111111))
      let rec = event.target.getBoundingClientRect()
      let index = Math.floor(event.offsetX/rec.width/0.125) + Math.floor(event.offsetY/rec.height/0.125) * 8
      if (side.side === 0b10) index = 63 - index
      const opponentSide = side.side === 0b01 ? 1 : 0
      if (MoveIsLegal()) {
        occupiedBoard.value[1 - opponentSide] = occupiedBoard.value[1 - opponentSide] ^ (BigInt(1) << BigInt(pieces.value.get(selectingPiece.value).PieceInfos[1] & 0b00111111))
        occupiedBoard.value[1 - opponentSide] = occupiedBoard.value[1 - opponentSide] ^ BigInt(1 << index)
        if ((occupiedBoard.value[opponentSide] >> BigInt(index)) % BigInt(2) !== BigInt(0)) {
          occupiedBoard.value[opponentSide] = occupiedBoard.value[opponentSide] ^ BigInt(1 << index)
          for (let [, value] of pieces.value) {
            if ((value.PieceInfos[1] & 0b00111111) === index) {
              pieces.value.delete(value.PieceInfos[0])
              break
            }
          }
        }
        pieces.value.get(selectingPiece.value).PieceInfos[1] = index
      }
      pieces.value.get(selectingPiece.value).Selected = false
      selectingPiece.value = 0
      // console.log("Moved to: ", IndexToAlgebraic(index))
    }
  }
</script>

<template>
  <div class="board" @click="MovePiece">
    <Piece @selecting-piece="SelectingPiece" v-for="piece in pieces" :side="side.side" :information="piece[1]" :key="piece[0]"/>
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