<script setup>
import {onBeforeMount, onMounted, ref, watch} from "vue";
import {SessionID} from "@/connection/connections.js";
import {useRouter} from "vue-router";
import {ExtractSideToMove} from "@/components/game/js/FEN.js";
import Board from "@/components/game/vue/board/Board.vue";
import {AlgebraicToIndex} from "@/components/game/js/Notation.js";
import {PlayPuzzle} from "@/components/game/js/Puzzle.js";
import {GetNotation} from "@/components/game/js/Moves.js";
import Theme from "@/components/game/vue/puzzle/Theme.vue";
const router = useRouter()
const props = defineProps(['fen', 'moves', 'rating','rating_deviation', 'theme'])
const sideToMove = ref(ExtractSideToMove(props.fen))
const side = ref(1 - sideToMove.value)
const legalMoves = ref([])
const board = ref(null)
let MoveGenerator
let moves = props.moves.split(" ")
let isPlaying = false
let find = null
let str = ""
let current_move = 0
let tmp_moves = []
let previousTarget = -1
let previousSource = -1
const result = ref(0)
const retry = ref(1)
const moved = ref([])
onBeforeMount(() => {
  if (!SessionID) router.push("/")
  MoveGenerator = new Worker("assets/scripts/stockfish-nnue-16.js")
  NewBoard()
})
function NewBoard() {
  MoveGenerator.onmessage = e => {
    if (e.data.toString() === "uciok") {
      StartPuzzle()
      MoveGenerator.onmessage = e => {
        let input = e.data.toString()
        if (input !== "" && !input.startsWith("Node")) tmp_moves.push(UCItoBinary(input.slice(0, input.indexOf(":")), board.value.pieces, find))
        else if (input.startsWith("Node")) {
          setTimeout(() => {
            legalMoves.value = tmp_moves
            moved.value.push(moves[current_move])
            current_move++
          }, 700)
        }
      }
    }
  }
  MoveGenerator.postMessage('uci')
}
function StartPuzzle() {
  str = "position fen " + props.fen + " moves " + moves[0]
  tmp_moves = [UCItoBinary(moves[0], board.value.pieces, find, true)]
  MoveGenerator.postMessage(str)
  MoveGenerator.postMessage('go perft 1')
}
onMounted(() => {
  find = board.value.FindPiece
})
function Move(move) {
  moved.value.push(GetNotation(move))
  if (moves[current_move] !== GetNotation(move)) {
    if (current_move === moves.length - 1) isCheckmate(move)
    else result.value = -1
    current_move++
    return
  }
  if (current_move === moves.length - 1) {
    result.value = 1
    current_move++
    return
  }
  current_move++
  tmp_moves = [UCItoBinary(moves[current_move], board.value.pieces, find, true)]
  str += " " + moves[current_move - 1] + " " + moves[current_move]
  MoveGenerator.postMessage(str)
  MoveGenerator.postMessage('go perft 1')
}
function ChangeSide() {
  sideToMove.value = 1 - sideToMove.value
}
function UCItoBinary(uci_move, pieces, find, setTarget=false) {
  let startSquare = AlgebraicToIndex(uci_move.slice(0, 2))
  let targetSquare = AlgebraicToIndex(uci_move.slice(2, 4))
  let promotion = uci_move.length === 5 ? uci_move[uci_move.length - 1] : null
  let movedPiece = pieces.get(find(startSquare))
  let flag = 0
  if ((uci_move === "e1g1" || uci_move === "e8g8") && (movedPiece.Piece[1] === 5 || movedPiece.Piece[1] === 13)) flag = 2
  else if ((uci_move === "e1c1" || uci_move === "e8c8") && (movedPiece.Piece[1] === 5 || movedPiece.Piece[1] === 13)) flag = 3
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
  else if ((find(targetSquare) !== -1 && targetSquare !== previousSource) || previousTarget === targetSquare) flag = 4
  if (setTarget) {
    previousSource = startSquare
    previousTarget = targetSquare
  }
  return startSquare | targetSquare << 6 | flag << 12
}
function isCheckmate(move) {
  MoveGenerator.onmessage = e => {
    let input = e.data.toString()
    if (input.startsWith("Nodes")) {
      if (input === "Nodes searched: 0") {
        result.value = 1
      } else {
        result.value = -1
      }
    }
  }
  MoveGenerator.postMessage(str + " " + GetNotation(move))
  MoveGenerator.postMessage("go perft 1")
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
function PlaySolution() {
  if (isPlaying) return
  Reset(result.value)
  retry.value = 0
  sideToMove.value = ExtractSideToMove(props.fen)
  board.value.Restart()
  isPlaying = true
  for (let i = 1; i <= moves.length; i++) {
    setTimeout( () => {
      legalMoves.value = [UCItoBinary(moves[i-1], board.value.pieces, find)]
      moved.value.push(moves[i-1])
      current_move++
      if (i === moves.length) isPlaying = false
    }, 1200*i)
  }
}
function Reset(_result=0) {
  sideToMove.value = ExtractSideToMove(props.fen)
  side.value = 1 - sideToMove.value
  moves = props.moves.split(" ")
  str = ""
  current_move = 0
  previousTarget = -1
  previousSource = -1
  result.value = _result
  retry.value = 1
  moved.value = []
}
function Retry() {
  if (isPlaying) return
  Reset()
  board.value.Restart()
  NewBoard()
}
function NextPuzzle() {
  if (isPlaying) return
  PlayPuzzle()
}
watch(props, () => {
  Reset()
  board.value.Restart()
  NewBoard()
})
</script>

<template>
  <div class="general">
    <div class="side">
      <div class="puzzle-info">Puzzle rating: {{props.rating}} ± {{props.rating_deviation}}
        <div style="color: forestgreen" v-if="result===1">Puzzle solved.</div>
        <div style="color: indianred" v-if="result===-1">Puzzle failed.</div>
        <div style="width: 70%; display: flex; justify-content: center">
          <button style="width: 45%" v-if="result===-1" class="pick-button" @click="PlaySolution">Solution</button>
          <button style="width: 45%" v-if="retry && result===-1" class="pick-button" @click="Retry">Retry</button>
        </div>
        <button class="pick-button" @click="NextPuzzle">Next puzzle</button>
        <button class="pick-button" @click="router.push('/dashboard')">Quit</button>
      </div>
      <div class="info-box">All player moves are the only moves.  I.e. playing any other move would considerably worsen the player position, except for checkmates, which can happen with several different moves.</div>
    </div>
      <div class="general-board">
      <Board ref="board" @make-move="Move" @change-side="ChangeSide" :side="side" :sideToMove="sideToMove" :pos="props.fen" :legalMoves="legalMoves"/>
    </div>
    <div class="side">
      <div class="move-container">
        <div class="move" v-if="!side">...</div>
        <div class="move" :class="(index === current_move-1) ? 'current-move': ''" v-for="(move, index) in moved">{{move}}</div>
      </div>
      <div style="height: 80%" class="info-box">
        <div style="font-family: gilroy-bold, sans-serif; font-size: 20px">Puzzle theme(s):</div>
        <Theme :themes="props.theme"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../../styles/UI.css";
@import "../../../dashboard/styles/UI.css";
.puzzle-info {
  width: 100%;
  border-radius: 12px;
  padding: 3% 1%;
  display: flex;
  flex-direction: column;
  background-color: #082c3a;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-family: gilroy-bold, sans-serif;
  font-size: 20px;
  box-sizing: border-box;
  margin: auto 0;
}
.pick-button:hover {
  background-color: #ad8463;
}
.move-container {
  width: 100%;
  height: 20%;
  border-radius: 10px;
  background-color: #082c3a;
  overflow: scroll;
  scrollbar-width: none;
}
.info-box {
  width: 100%;
  height: 15%;
  margin-top: 2%;
  background-color: #082c3a;
  border-radius: 10px;
  padding: 2%;
  box-sizing: border-box;
  text-align: center;
  font-size: 15px;
  overflow: scroll;
  scrollbar-width: none;
}
.side {
  width: 20%;
  height: 100%;
  color: white;
  font-family: gilroy-medium, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>