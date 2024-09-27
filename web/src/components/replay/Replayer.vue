<script setup>
import {onBeforeMount, onBeforeUnmount, ref} from "vue";
import Board from "@/components/game/vue/Board.vue";
import {FENStart} from "@/components/game/js/FEN.js";
import {GetNotation} from "@/components/game/js/Moves.js";
import {Replays} from "@/components/dashboard/replays.js";
import {useRouter} from "vue-router";
import {SessionID} from "@/connection/connections.js";
import Rating from "@/components/game/vue/Rating.vue";
import {ExtractCP} from "@/components/replay/engine.js";
const router = useRouter()
let evaler
const props = defineProps(['id'])
const moves = ref([])
const gameinfo = ref(null)
const move_array = ref(null)
const rating = ref({rate: [59, 940, 1]})
const win_rate = [50, 50]
let move_string = "position startpos moves"
onBeforeMount(() => {
  if (!SessionID) {
    router.push("/dashboard")
  }
  else {
    const _moves = Replays.find(element => element.game_id === props.id)
    if (!_moves) {
      router.push("/dashboard")
    } else {
      gameinfo.value = _moves
      move_array.value = Base64ToUint16(_moves.moves)
      move_array.value.forEach((value) => {
        moves.value.push(GetNotation(value))
      })
      evaler = new Worker("assets/scripts/stockfish-nnue-16.js")
      evaler.onmessage = (e) => {
        let input = e.data.toString()
        if (input[11] === "1" && input[12] === "2") {
          let evaluation = ExtractCP(input)
          if (!evaluation[0]) {
            win_rate[sideToMove.value] = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * evaluation[1])) - 1)
            console.log(win_rate)
          }
          else {

          }
          let data = evaluation[2]
          if (current_move_index.value % 2 !== 0) {
            if (!sideToView.value) {
              rating.value.rate = data.reverse()
            }
            else rating.value.rate = data
          }
          else {
            if (!sideToView.value) {
              rating.value.rate = data
            }
            else rating.value.rate = data.reverse()
          }
        }
      }
      evaler.postMessage('uci')
      evaler.postMessage('setoption name UCI_ShowWDL value true')
      evaler.postMessage('setoption name UCI_AnalyseMode value true')
      evaler.postMessage('setoption name Use NNUE value true')
    }
  }
})
function Base64ToUint16(base64) {
  let binaryString = atob(base64);
  let bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  let uint16 = new Uint16Array(bytes.length / 2)
  let counter = 0
  for (let i = 0; i < uint16.length; i++) {
    uint16[uint16.length - i - 1] = (bytes[counter] << 8) | bytes[counter + 1]
    counter += 2
  }
  return uint16
}
const current_move = ref({moves: []})
const current_move_index = ref(0)
const list = ref(null)
const move_ref = ref(null)
function NextMove() {
  if (current_move_index.value < move_array.value.length) {
    move_string += " " + GetNotation(move_array.value[current_move_index.value])
    current_move.value.moves = new Uint16Array([move_array.value[current_move_index.value++]])
    evaler.postMessage(move_string)
    evaler.postMessage("go depth 12")
    if (current_move_index.value >= 1) list.value.scrollTop = move_ref.value[current_move_index.value - 1].offsetTop
  }
}
const sideToMove = ref(0);

function ChangeSide() {
  sideToMove.value = 1 - sideToMove.value;
}
function FlipWatch() {
  sideToView.value = 1 - sideToView.value
  rating.value.rate = rating.value.rate.reverse()
}
const sideToView = ref(0)
const board_ref = ref(null)
function PreviousMove() {
  if (current_move_index.value) {
    board_ref.value.UnmakeMove(move_array.value[--current_move_index.value], move_array.value[current_move_index.value - 1])
    move_string = move_string.slice(0, move_string.lastIndexOf(" "))
    evaler.postMessage(move_string)
    evaler.postMessage("go depth 12")
    if (current_move_index.value - 1 >= 0) list.value.scrollTop = move_ref.value[current_move_index.value - 1].offsetTop
  }
}
function Advance(event) {
  if (event.key === "ArrowRight") NextMove()
  else if (event.key === "ArrowLeft") PreviousMove()
  else if (event.key === "Tab") {
    FlipWatch()
    event.stopPropagation()
    event.preventDefault()
  }
  else if (event.key === "Escape") {
    ReturnToDashboard()
  }
}
document.addEventListener("keydown", Advance)
onBeforeUnmount(() => {
  document.removeEventListener("keydown", Advance)
  evaler.terminate()
})
function ReturnToDashboard() {
  router.push({path : "/dashboard"})
}
</script>

<template>
  <Board ref="board_ref" @change-side="ChangeSide" :side="sideToView" :side-to-move="sideToMove" :pos="FENStart" :legal-moves="current_move" :replaying="true"/>
  <div class="match-info">
    <div style="width: 95%; height: 100%; display: flex; flex-direction: column; flex-shrink: 0">
      <div style="width: 100%; height: 5%; display: flex">
        <button style="background-image: url('/assets/images/leave.svg')" class="info-buttons" @click="ReturnToDashboard"/>
        <button style="background-image: url('/assets/images/analyze.svg')" class="info-buttons"/>
      </div>
      <div style="width: 100%; flex: 1; display: flex; align-items: center; flex-direction: column; padding-top: 5px">
        <div style="width: 100%; height: 50%; display: flex; align-items: center; flex-direction: column; border-bottom: 1px solid white">
          <div style="flex: 1; color: white">{{sideToView ? gameinfo.white_player ? gameinfo.white_player : "BOT" : gameinfo.black_player ? gameinfo.black_player : "BOT"}}</div>
          <div style="scrollbar-width: thin; overflow-y: scroll; font-size: 16px; height: 90%; flex-shrink: none; width: 100%; padding: 0 3px; box-sizing: border-box">

          </div>
        </div>
        <div style="width: 100%; height: 50%; display: flex; align-items: center; flex-direction: column; padding-bottom: 5px">
          <div style="scrollbar-width: thin; overflow-y: scroll; font-size: 16px; height: 90%; flex-shrink: none; width: 100%; padding: 0 3px; box-sizing: border-box">

          </div>
          <div style="flex: 1; color: white">{{sideToView ? gameinfo.black_player ? gameinfo.black_player : "BOT" : gameinfo.white_player ? gameinfo.white_player : "BOT"}}</div>
        </div>
      </div>
    </div>
    <Rating :key="sideToView" :side="sideToView" :rating="rating"/>
  </div>


  <div style="flex-direction: column; display: flex; position: absolute; left: 75%; right: 5%; top: 5%; height: 90%">
    <div ref="list" class="move-list">
      <div class="move" v-for="(move, index) in moves" ref="move_ref" :class="index === current_move_index - 1 ? 'current-move' : ''">{{!(index % 2) ? index/2 + 1 + ". ": ""}}{{move}}</div>
    </div>
    <div style="display: flex; flex: 1">
      <button style="background-image: url('/assets/images/arrow.svg'); transform: scaleX(-1)" class="buttons" @click="PreviousMove"/>
      <button style="background-image: url('/assets/images/arrow.svg')" class="buttons" @click="NextMove"/>
      <button style="background-image: url('/assets/images/flip.svg')" class="buttons" @click="FlipWatch"/>
    </div>
  </div>
</template>

<style scoped>
@import "../dashboard/UI.css";
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
  display: flex;
  position: absolute;
  top: 5%;
  left: 1%;
  width: 25%;
  height: 90%;
  border: 1px solid black;
  align-items: center;
  background-color: #082c3a;
  font-family: gilroy-medium, sans-serif;
  font-size: 25px;
  color: white;
}
.info-buttons {
  background-color: #727687;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 15%;
  height: 100%;
  width: 50%;
  border: none;
}
.info-buttons:hover {
  background-color: lightseagreen;
}
</style>