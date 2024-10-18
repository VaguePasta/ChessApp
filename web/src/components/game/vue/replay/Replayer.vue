<script setup>
import {onBeforeMount, onBeforeUnmount, onMounted, ref} from "vue";
import Board from "@/components/game/vue/board/Board.vue";
import {FENStart} from "@/components/game/js/FEN.js";
import {GetNotation} from "@/components/game/js/Moves.js";
import {Replays} from "@/components/dashboard/replays.js";
import {useRouter} from "vue-router";
import {SessionID} from "@/connection/connections.js";
import Rating from "@/components/game/vue/replay/Rating.vue";
import {ExtractCP, Base64ToUint16} from "@/components/game/js/engine.js";
import Mistakes from "@/components/game/vue/replay/Mistakes.vue";
import Evaluations from "@/components/game/vue/replay/Evaluations.vue";
import Chart from "@/components/game/vue/replay/Chart.vue";
const router = useRouter()
let evaler
const props = defineProps(['id'])
const moves = ref([])
const gameinfo = ref(null)
const sideToView = ref(0)
let move_array = null
const rating = ref([50, 50])
const evaluations = ref(["", ""])
const analyzed = ref([])
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
      analyzed.value.push(evaluation)
    }
    else if (input.slice(0,8) === "bestmove") {
      if (current_move_index.value && !analyzed.value[analyzed.value.length - 1][0]) {
        accuracy[1 - sideToMove.value] =
            (
                (
                    accuracy[1 - sideToMove.value] * Math.floor((analyzed.value.length - 2) / 2))
                    + MoveAccuracy(analyzed.value[analyzed.value.length - 1]
                )
            ) / Math.ceil((analyzed.value.length - 1) / 2)
      }
      ProcessEvaluation(analyzed.value[analyzed.value.length - 1], sideToMove.value)
      bestmove = input.slice(9, 13).trimEnd()
      analyze_complete.value = true
    }
  }
})
function MoveAccuracy(lastAnalysis) {
  let winRate = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * lastAnalysis[1])) - 1)
  let diff = winRate - rating.value[sideToMove.value]
  if (diff <= 0) return 100
  let raw  = (103.1668100711649 * Math.exp(-0.04354415386753951 * diff) + -3.166924740191411) + 1
  return Math.max(0, Math.min(raw, 100))
}
function ProcessEvaluation(evaluation, side) {
  if (!evaluation[0]) {
    let winRate = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * evaluation[1])) - 1)
    let winDiff = winRate - rating.value[side]
    if (!previous && winDiff >= 5) {
        if (current_best_move === bestmoves.length) {
          bestmoves.push(bestmove)
        }
        if (winDiff <= 10) {
          mistake.value = "#56b4e9"
          if (!moves.value[current_move_index.value - 1].endsWith("!?")) moves.value[current_move_index.value - 1] += "!?"
          evaluations.value[1 - side] += Math.ceil(current_move_index.value / 2) + ". " + moves.value[current_move_index.value - 1] + ": Inaccuracy. "
              + bestmoves[current_best_move] + " was best.\n"
        } else if (winDiff <= 15) {
          mistake.value = "#e69f00"
          if (!moves.value[current_move_index.value - 1].endsWith("?")) moves.value[current_move_index.value - 1] += "?"
          evaluations.value[1 - side] += Math.ceil(current_move_index.value / 2) + ". " + moves.value[current_move_index.value - 1] + ": Mistake. "
              + bestmoves[current_best_move] + " was best.\n"
        } else {
          mistake.value = "#df5353"
          if (!moves.value[current_move_index.value - 1].endsWith("??")) moves.value[current_move_index.value - 1] += "??"
          evaluations.value[1 - side] += Math.ceil(current_move_index.value / 2) + ". " + moves.value[current_move_index.value - 1] + ": Blunder. "
              + bestmoves[current_best_move] + " was best.\n"
        }
        current_best_move++
    }
    else if (previous && winDiff >= 5 && current_best_move) {
      current_best_move--
    }
    else if (!previous && winDiff <= -5) {
      mistake.value = "#26c2a3"
      if (!moves.value[current_move_index.value - 1].endsWith("!!")) moves.value[current_move_index.value - 1] += "!!"
      evaluations.value[1 - side] += Math.ceil(current_move_index.value / 2) + ". " + moves.value[current_move_index.value - 1] + ": Brilliant."
    }
    rating.value[side] = winRate
    rating.value[1 - side] = 100 - winRate
  }
  else if (!previous) {
    evaluations.value[1 - side] += Math.ceil(current_move_index.value / 2) + ". " + moves.value[current_move_index.value - 1] + ": Mate in " + Math.abs(evaluation[1]) + ".\n"
  }
}
onMounted(() => {
  evaler.postMessage('uci')
  evaler.postMessage('setoption name UCI_AnalyseMode value true')
  evaler.postMessage('setoption name Use NNUE value true')
  evaler.postMessage('setoption name Threads value ' + navigator.hardwareConcurrency)
  evaler.postMessage('setoption name Hash value 64')
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
const current_move = ref([])
const current_move_index = ref(0)
const list = ref(null)
const move_ref = ref(null)
const board_ref = ref(null)
const list_top = ref(null)
let accuracy = [0, 0]
function NextMove() {
  if (!analyze_complete.value || current_move_index.value >= move_array.length) return
  previous = false
  mistake.value = null
  if (move_string === "position startpos") move_string = "position startpos moves"
  move_string += " " + GetNotation(move_array[current_move_index.value])
  current_move.value = new Uint16Array([move_array[current_move_index.value++]])
  if (current_move_index.value >= 1) list.value.scrollTop = move_ref.value[current_move_index.value - 1].offsetTop - list_top.value.offsetTop
  if (analyzed.value.length >= current_move_index.value + 1) {
    ProcessEvaluation(analyzed.value[current_move_index.value], 1 - sideToMove.value)
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
  if (current_move_index.value - 1 >= 0) list.value.scrollTop = move_ref.value[current_move_index.value - 1].offsetTop - list_top.value.offsetTop
  ProcessEvaluation(analyzed.value[current_move_index.value], sideToMove.value)
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
  bestmoves = []
  bestmove = null
  move_array = null
  current_best_move = 0
  previous = false
  accuracy = []
})
</script>

<template>
  <div class="general">
    <div class="match-info">
        <div class="match-eval">
          <div class="eval-box" style="border-bottom: 5px groove white">
            <div class="player-info" style="border-bottom: 1px solid white">
              <div class="player-name">
                {{sideToView ? gameinfo.white_player ? gameinfo.white_player : "BOT" : gameinfo.black_player ? gameinfo.black_player : "BOT"}}
              </div>
              <div class="accuracy">
                <div class="accuracy-image"/>
                <div style="flex: 1">{{sideToView ? accuracy[0].toFixed(2) : accuracy[1].toFixed(2)}}%</div>
              </div>
            </div>
            <Evaluations :evaluation="sideToView ? evaluations[0] : evaluations[1]"/>
          </div>
          <div class="eval-box" style="padding-bottom: 0.7%">
            <Evaluations :evaluation="sideToView ? evaluations[1] : evaluations[0]"/>
            <div class="player-info" style="border-top: 1px solid white">
              <div class="player-name">
                {{sideToView ? gameinfo.black_player ? gameinfo.black_player : "BOT" : gameinfo.white_player ? gameinfo.white_player : "BOT"}}
              </div>
                <div class="accuracy">
                  <div class="accuracy-image"/>
                  <div style="flex: 1">{{sideToView ? accuracy[1].toFixed(2) : accuracy[0].toFixed(2)}}%</div>
                </div>
            </div>
          </div>
        </div>
        <Rating :key="sideToView" :side="sideToView" :rating="rating" :analyzed="analyze_complete"/>
    </div>
    <div class="general-board">
    <Board ref="board_ref" @change-side="ChangeSide" :side="sideToView" :side-to-move="sideToMove" :pos="FENStart" :legalMoves="current_move"/>
    <Mistakes :mistake="mistake" :position="current_move[0]" :side="sideToView" :key="sideToView"/>
  </div>
    <div class="chart-and-moves">
      <div class="win-chart-box">
        <Chart :side="sideToView" :current="current_move_index" :data="analyzed"/>
      </div>
      <div ref="list_top" style="flex-direction: column; display: flex; height: 49.5%; width: 100%">
        <div ref="list" class="move-list">
          <div class="move" v-for="(move, index) in moves" ref="move_ref" :class="index === current_move_index - 1 ? 'current-move' : ''">{{!(index % 2) ? index/2 + 1 + ". ": ""}}{{move}}</div>
        </div>
        <div style="padding-top: 1%; display: flex; flex: 1; justify-content: space-between">
          <button style="background-image: url('/assets/images/p_arrow.svg')" class="buttons" @click="PreviousMove"/>
          <button style="background-image: url('/assets/images/arrow.svg')" class="buttons" @click="NextMove"/>
          <button style="background-image: url('/assets/images/flip.svg')" class="buttons" @click="FlipWatch"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../../../dashboard/styles/UI.css";
@import "../../styles/UI.css";
.buttons {
  background-color: #1e2327;
  border: 1px solid black;
  padding: 2%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 25%;
  width: 33%;
  border-radius: 14px;
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
  border-radius: 15px;
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
.accuracy {
  text-align: right;
  width: 30%;
  padding: 0 1.5%;
  border-left: 1px solid white;
  display: flex;
  overflow: hidden;
}
.accuracy-image {
  height: 100%;
  width: 20%;
  background-image: url('/assets/images/accuracy.svg');
  background-repeat: no-repeat;
  background-position: center; background-size: 100%;
  flex-shrink: 0;
}
.player-info {
  width: 100%;
  display: flex;
  flex: 1;
  color: white;
}
.player-name {
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding-left: 2%
}
.eval-box {
  width: 100%;
  height: 50%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  flex-direction: column;
}
.match-eval {
  height: 100%;
  width: 95%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 5px;
}
.chart-and-moves {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 25%;
  justify-content: space-between
}
.win-chart-box {
  padding: 1%;
  height: 49.5%;
  display: block;
  width: 100%;
  background-color: #082c3a;
  box-sizing: border-box;
  border-radius: 14px;
}
</style>