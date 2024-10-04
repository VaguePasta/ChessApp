<script setup>
import {onBeforeMount, onMounted, ref} from "vue";
import {SessionID} from "@/connection/connections.js";
import {useRouter} from "vue-router";
import {ExtractSideToMove} from "@/components/game/js/FEN.js";
import Board from "@/components/game/vue/board/Board.vue";
import {AlgebraicToIndex} from "@/components/game/js/Notation.js";
const router = useRouter()
const props = defineProps(['fen', 'moves'])
const sideToMove = ref(ExtractSideToMove(props.fen))
const side = 1 - sideToMove.value
const legalMoves = ref([])
const board = ref(null)
const moves = props.moves.split(" ")
let find = null
onBeforeMount(() => {
  if (!SessionID) router.push("/")
})
onMounted(() => {
  find = board.value.FindPiece
})
function Move(move) {
  console.log(move)
}
function ChangeSide() {
  sideToMove.value = 1 - sideToMove.value
}
function UCItoBinary(uci_move, pieces, find) {
  let startSquare = AlgebraicToIndex(uci_move.slice(0, 2))
  let targetSquare = AlgebraicToIndex(uci_move.slice(2, 4))
  let promotion = uci_move.length === 5 ? uci_move[uci_move.length - 1] : null
  let movedPiece = pieces.get(find(startSquare))
  let flag = 0
  if (uci_move === "e1g1" || uci_move === "e8g8") flag = 2
  else if (uci_move === "e1c1" || uci_move === "e8c8") flag = 3
  else if (!(movedPiece.Piece[1] % 8)) {
    if (!promotion) {
      if (Math.abs(targetSquare - startSquare) === 16) flag = 1
      else if (Math.abs(targetSquare - startSquare) === 8) flag = 0
      else {
        if (find(targetSquare) !== -1) flag = 4
        else flag = 5
      }
    }
    else {
      if (Math.abs(targetSquare - startSquare) === 8) flag = GetPromotion(promotion, false)
      else flag = GetPromotion(promotion, true)
    }
  }
  else if (find(targetSquare) !== -1) flag = 4
  return startSquare | targetSquare << 6 | flag << 12
}
function GetPromotion(promotion, isCapture) {
  switch (promotion) {
    case 'n':
      return isCapture ? 12 : 8
    case 'b':
      return isCapture ? 13 : 9
    case 'r':
      return isCapture ? 14 : 10
    case 'q':
      return isCapture ? 15 : 11
  }
}
onMounted(() => {
  for (let i = 1; i <= moves.length; i++) {
    setTimeout( () => {
      legalMoves.value = [UCItoBinary(moves[i-1], board.value.pieces, find)]
    }, 1000*i)
  }
})
</script>

<template>
  <div class="board-container">
    <Board ref="board" @make-move="Move" @change-side="ChangeSide" :side="side" :sideToMove="sideToMove" :pos="fen" :legalMoves="legalMoves"/>
  </div>
  <button @click="router.push('/dashboard')">Quit</button>
</template>

<style scoped>
.board-container {
  position: absolute;
  height: 90%;
  aspect-ratio: 1/1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>