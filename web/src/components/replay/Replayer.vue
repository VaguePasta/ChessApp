<script setup>
import {onBeforeMount, onBeforeUnmount, onMounted, ref} from "vue";
import Board from "@/components/game/vue/Board.vue";
import {FENStart} from "@/components/game/js/FEN.js";
import {GetNotation} from "@/components/game/js/Moves.js";
import {Replays} from "@/components/dashboard/replays.js";
import {useRouter} from "vue-router";
import {SessionID} from "@/connection/connections.js";
import Rating from "@/components/replay/Rating.vue";
import {ExtractCP, Base64ToUint16} from "@/components/replay/engine.js";
import Mistakes from "@/components/replay/Mistakes.vue";
import Evaluations from "@/components/replay/Evaluations.vue";
const router = useRouter()
let evaler
const props = defineProps(['id'])
const moves = ref([])
const gameinfo = ref(null)
const sideToView = ref(0)
let move_array = null
const rating = ref({rate: [50, 50]})
const evaluations = ref(["", ""])
const analyzed = []
let move_string = "position startpos moves"
let bestmove
let bestmoves = []
let current_best_move = 0
let previous = false
let analyze_complete = ref(false)
let mistake = ref(null)
onBeforeMount(() => {
  if (!SessionID) {
    router.push("/dashboard")
    return
  }
  const _moves = Replays.find(element => element.game_id === props.id)
  if (!_moves) {
    router.push("/dashboard")
    return;
  }
  document.addEventListener("keydown", Keypress)
  gameinfo.value = _moves
  move_array = Base64ToUint16(_moves.moves)
  move_array.forEach((value) => {
    moves.value.push(GetNotation(value))
  })
  evaler = new Worker("assets/scripts/stockfish-nnue-16.js")
  evaler.onmessage = (e) => {
    let input = e.data.toString()
    if (input.slice(0, 13) === "info depth 16" && input.indexOf("currmove") === -1) {
      let evaluation = ExtractCP(input)
      analyzed.push(evaluation)
    }
    else if (input.slice(0,8) === "bestmove") {
      ProcessEvaluation(analyzed[analyzed.length - 1], sideToMove.value)
      bestmove = input.slice(9, 13).trimEnd()
      analyze_complete.value = true
    }
  }
})
function ProcessEvaluation(evaluation, side) {
  if (!evaluation[0]) {
    let winRate = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * evaluation[1])) - 1)
    let winDiff = winRate - rating.value.rate[side]
    if (!previous) {
      if (current_move_index.value && analyzed[current_move_index.value - 1][0]) {
        mistake.value = "#e69f00"
        evaluations.value[1 - side] +=
            Math.ceil(current_move_index.value / 2) + ". " + moves.value[current_move_index.value - 1]
            + ": Force checkmate missed.\n"
      }
      else if (winDiff >= 5) {
        if (bestmove) {
          bestmoves.push(bestmove)
        }
        if (winDiff <= 10) {
          mistake.value = "#56b4e9"
          evaluations.value[1 - side] += Math.ceil(current_move_index.value / 2) + ". " + moves.value[current_move_index.value - 1] + ": Inaccuracy. "
              + bestmoves[current_best_move] + " was best.\n"
        } else if (winDiff <= 15) {
          mistake.value = "#e69f00"
          evaluations.value[1 - side] += Math.ceil(current_move_index.value / 2) + ". " + moves.value[current_move_index.value - 1] + ": Mistake. "
              + bestmoves[current_best_move] + " was best.\n"
        } else {
          mistake.value = "#df5353"
          evaluations.value[1 - side] += Math.ceil(current_move_index.value / 2) + ". " + moves.value[current_move_index.value - 1] + ": Blunder. "
              + bestmoves[current_best_move] + " was best.\n"
        }
        current_best_move++
      }
    }
    else if (previous && winDiff >= 5 && current_best_move) {
      current_best_move--
    }
    rating.value.rate[side] = winRate
    rating.value.rate[1 - side] = 100 - winRate
  }
  else if (!previous) {
    evaluations.value[1 - side] += Math.ceil(current_move_index.value / 2) + ". " + moves.value[current_move_index.value - 1] + ": Mate in " + Math.abs(evaluation[1]) + ".\n"
  }
}
onMounted(() => {
  evaler.postMessage('uci')
  evaler.postMessage('setoption name UCI_AnalyseMode value true')
  evaler.postMessage('setoption name Use NNUE value true')
  evaler.postMessage('position startpos')
  evaler.postMessage('go depth 16')
})
const sideToMove = ref(0);
function ChangeSide() {
  sideToMove.value = 1 - sideToMove.value;
}
function FlipWatch() {
  sideToView.value = 1 - sideToView.value
}
const current_move = ref({moves: []})
const current_move_index = ref(0)
const list = ref(null)
const move_ref = ref(null)
const board_ref = ref(null)
function NextMove() {
  if (!analyze_complete.value || current_move_index.value >= move_array.length) return
  previous = false
  mistake.value = null
  if (move_string === "position startpos") move_string = "position startpos moves"
  move_string += " " + GetNotation(move_array[current_move_index.value])
  current_move.value.moves = new Uint16Array([move_array[current_move_index.value++]])
  if (current_move_index.value >= 1) list.value.scrollTop = move_ref.value[current_move_index.value - 1].offsetTop
  if (analyzed.length >= current_move_index.value + 1) {
    ProcessEvaluation(analyzed[current_move_index.value], 1 - sideToMove.value)
  }
  else if (current_move_index.value < move_array.length) {
    analyze_complete.value = false
    evaler.postMessage(move_string)
    evaler.postMessage("go depth 16")
  }
  else if (current_move_index.value === move_array.length) analyze_complete.value = true
}
function PreviousMove() {
  if (!analyze_complete.value || !current_move_index.value) return
  previous = true
  mistake.value = null
  board_ref.value.UnmakeMove(move_array[--current_move_index.value], move_array[current_move_index.value - 1])
  move_string = move_string.slice(0, move_string.lastIndexOf(" "))
  if (move_string.slice(move_string.length - 5) === 'moves') move_string = "position startpos"
  let previousEvaluation = evaluations.value[sideToMove.value].lastIndexOf(Math.ceil((current_move_index.value + 1) / 2) + ".")
  if (previousEvaluation !== -1) {
    evaluations.value[sideToMove.value] = evaluations.value[sideToMove.value].slice(0, previousEvaluation)
  }
  if (current_move_index.value - 1 >= 0) list.value.scrollTop = move_ref.value[current_move_index.value - 1].offsetTop
  bestmove = null
  ProcessEvaluation(analyzed[current_move_index.value], sideToMove.value)
}
function Keypress(event) {
  if (event.key === "ArrowRight") NextMove()
  else if (event.key === "ArrowLeft") PreviousMove()
  else if (event.key === "Tab") {
    FlipWatch()
    event.stopPropagation()
    event.preventDefault()
  }
  else if (event.key === "Escape") {
    router.push({path : "/dashboard"})
  }
}
onBeforeUnmount(() => {
  document.removeEventListener("keydown", Keypress)
  evaler.terminate()
})
</script>

<template>
  <div class="analyze">
    <div class="match-info">
        <div style="height: 100%; width: 95%; flex-shrink: 0; display: flex; align-items: center; flex-direction: column; padding-top: 5px">
          <div style="width: 100%; height: 50%; display: flex; align-items: center; flex-direction: column; border-bottom: 1px solid white">
            <div style="flex: 1; color: white">{{sideToView ? gameinfo.white_player ? gameinfo.white_player : "BOT" : gameinfo.black_player ? gameinfo.black_player : "BOT"}}</div>
            <Evaluations :evaluation="sideToView ? evaluations[0] : evaluations[1]"/>
          </div>
          <div style="width: 100%; height: 50%; display: flex; align-items: center; flex-direction: column; padding-bottom: 5px">
            <Evaluations :evaluation="sideToView ? evaluations[1] : evaluations[0]"/>
            <div style="flex: 1; color: white">{{sideToView ? gameinfo.black_player ? gameinfo.black_player : "BOT" : gameinfo.white_player ? gameinfo.white_player : "BOT"}}</div>
          </div>
        </div>
        <Rating :key="sideToView" :side="sideToView" :rating="rating" :analyzed="analyze_complete"/>
    </div>
    <div style="position: relative; left: 0; top: 0; height: 100%; aspect-ratio: 1/1; display: inline-block">
    <Board ref="board_ref" @change-side="ChangeSide" :side="sideToView" :side-to-move="sideToMove" :pos="FENStart" :legal-moves="current_move"/>
    <Mistakes :mistake="mistake" :position="current_move.moves[0]" :side="sideToView" :key="sideToView"/>
  </div>
    <div style="flex-direction: column; display: inline-flex; height: 100%; width: 20%">
    <div ref="list" class="move-list">
      <div class="move" v-for="(move, index) in moves" ref="move_ref" :class="index === current_move_index - 1 ? 'current-move' : ''">{{!(index % 2) ? index/2 + 1 + ". ": ""}}{{move}}</div>
    </div>
    <div style="display: flex; flex: 1">
      <button style="background-image: url('/assets/images/arrow.svg'); transform: scaleX(-1)" class="buttons" @click="PreviousMove"/>
      <button style="background-image: url('/assets/images/arrow.svg')" class="buttons" @click="NextMove"/>
      <button style="background-image: url('/assets/images/flip.svg')" class="buttons" @click="FlipWatch"/>
    </div>
  </div>
  </div>

</template>

<style scoped>
@import "../dashboard/UI.css";
.analyze {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  height: 90%;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
}
.move-list {
  height: 95%;
  overflow-y: scroll;
  color: white;
  background-color: #082c3a;
  scrollbar-width: thin;
  width: 100%;
  flex-shrink: none;
}
.move {
  padding: 2%;
  border-style: none;
  box-sizing: border-box;
  width: 50%;
  display: inline-block;
}
.current-move {
  background-color: #3d576e;
}
.buttons {
  background-color: #1e2327;
  border-style: solid;
  border-color: black;
  border-width: 1px 1px 1px 0;
  padding: 2%;
  margin: 1% 0;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 25%;
  height: 100%;
  width: 33.33%;
}
.buttons:hover {
  background-color: gray;
}
.match-info {
  display: inline-flex;
  background-color: #082c3a;
  width: 25%;
  height: 100%;
  align-items: center;
  font-family: gilroy-medium, sans-serif;
  font-size: 25px;
  color: white;
}
.info-buttons {
  background-color: #727687;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 10%;
  height: 100%;
  width: 100%;
  border: none;
}
.info-buttons:hover {
  background-color: lightseagreen;
}
</style>