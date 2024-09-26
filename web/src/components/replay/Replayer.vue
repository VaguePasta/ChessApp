<script setup>
import {onBeforeUnmount, ref} from "vue";
import Board from "@/components/game/vue/Board.vue";
import {FENStart} from "@/components/game/js/FEN.js";
import {GetNotation} from "@/components/game/js/Moves.js";
import {Replays} from "@/components/dashboard/replays.js";
import {useRouter} from "vue-router";
const router = useRouter()
const props = defineProps(['id'])
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
const moves = ref([])
const current_move = ref({moves: []})
const move_array = Base64ToUint16(Replays.find(element => element.game_id === props.id).moves)
move_array.forEach((value) => {
  moves.value.push(GetNotation(value))
})
const current_move_index = ref(0)
const list = ref(null)
const move_ref = ref(null)
function NextMove() {
  if (current_move_index.value < move_array.length) {
    current_move.value.moves = new Uint16Array([move_array[current_move_index.value++]])
    if (current_move_index.value > 1) list.value.scrollTop = move_ref.value[current_move_index.value - 1].offsetTop
  }
}
const sideToMove = ref(0);

function ChangeSide() {
  sideToMove.value = 1 - sideToMove.value;
}
function FlipWatch() {
  sideToView.value = 1 - sideToView.value
}
const sideToView = ref(0)
const board_ref = ref(null)
function PreviousMove() {
  if (current_move_index.value > 0) {
    board_ref.value.UnmakeMove(move_array[--current_move_index.value], move_array[current_move_index.value - 1])
    list.value.scrollTop = move_ref.value[current_move_index.value - 1].offsetTop
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
})
function ReturnToDashboard() {
  router.push({path : "/dashboard"})
}
</script>

<template>
  <Board ref="board_ref" @change-side="ChangeSide" :side="sideToView" :side-to-move="sideToMove" :pos="FENStart" :legal-moves="current_move" :replaying="true"/>
  <button @click="NextMove">Advance</button>
  <button @click="PreviousMove">Reverse</button>
  <button @click="FlipWatch">Flip side</button>
  <button @click="ReturnToDashboard">Return</button>
  <div ref="list" class="move-list">
    <div class="move" v-for="(move, index) in moves" ref="move_ref" :class="index === current_move_index - 1 ? 'current-move' : ''">{{index + 1}}. {{move}}</div>
  </div>
</template>

<style scoped>
.move-list {
  height: 90%;
  overflow-y: scroll;
  color: white;
  background-color: #082c3a;
  position: absolute;
  left: 75%;
  right: 5%;
  top: 5%;
  scrollbar-width: thin;
}
.move {
  padding: 2%;
  border: 1px solid black;
  box-sizing: border-box;
}
.current-move {
  background-color: #81b64c;
}
</style>