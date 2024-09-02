<script setup lang="ts">
  import Piece from "./Piece.vue";
  import {ref} from "vue";
  import {ParseFEN} from "./FEN.ts";
  import {PopulateOccupiedBoards} from "./Bitboards.ts";
  import {GetSourceSquare, GetTargetSquare, MakeMove} from "./Moves.ts";
  let selectingPiece = ref(0)
  const side = defineProps(['side'])
  let sideToMove = ref(0)
  const pieces: any = ref(ParseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"));
  const occupiedBoard = ref(PopulateOccupiedBoards(pieces.value))
  function MoveIsLegal(): boolean {
    return true
  }
  function SelectingPiece(event: any, pieceNumber: number) {
    if (side.side !== sideToMove.value) return
    if (selectingPiece.value === 0) {
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
  function Move(move: number): void {
    let sourceSquare = GetSourceSquare(move)
    let targetSquare = GetTargetSquare(move)
    console.log(sourceSquare + '---' + targetSquare)
    let piece = -1
    if (selectingPiece.value !== 0) {
      piece = selectingPiece.value
    }
    else {
      for (let [, value] of pieces.value) {
        if ((value.Piece[1]) === sourceSquare) {
          piece = value.Piece[0]
          break
        }
      }
      if (piece == -1) return
    }
    pieces.value.get(piece).Selected = true
    if (MoveIsLegal()) {
      occupiedBoard.value[sideToMove.value] = occupiedBoard.value[sideToMove.value] ^ BigInt(1 << sourceSquare)
      occupiedBoard.value[sideToMove.value] = occupiedBoard.value[sideToMove.value] ^ BigInt(1 << targetSquare)
      occupiedBoard.value[1 - sideToMove.value] = occupiedBoard.value[1 - sideToMove.value] ^ BigInt(1 << targetSquare)
        for (let [, value] of pieces.value) {
          if ((value.Piece[1]) === targetSquare) {
            pieces.value.delete(value.Piece[0])
            break
          }
        }
      sideToMove.value = 1 - sideToMove.value
      pieces.value.get(piece).Piece[1] = Number(targetSquare)
    }
    pieces.value.get(piece).Selected = false
  }
  function MovePiece(event: any) {
    event.preventDefault()
    event.stopPropagation()
    if (selectingPiece.value !== 0) {
      let rec = event.target.getBoundingClientRect()
      let index = Math.floor(event.offsetX/rec.width/0.125) + Math.floor(event.offsetY/rec.height/0.125) * 8
      if (side.side === 1) index = 63 - index
      Move(MakeMove(pieces.value.get(selectingPiece.value).Piece[1], index))
      selectingPiece.value = 0
    }
  }
</script>

<template>
  <div class="board" @click="MovePiece">
    <Piece @selecting-piece="SelectingPiece" v-for="piece in pieces" :side="side.side" :sideToMove="sideToMove" :information="piece[1]" :key="piece[0]"/>
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