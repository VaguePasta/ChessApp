<script setup>
import {onBeforeUnmount, ref} from "vue";
import Board from "@/components/game/vue/Board.vue";
import {FENStart} from "@/components/game/js/FEN.js";

const props = defineProps(['record'])
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
const move_array = Base64ToUint16("BTxHZReOCW4PFAKlBQsLdUL7QsgC2wIgvvMLtw/7SCJO/A3+DwRIoUNGQ18DVAh5CBgL9wULB+0Fzw5pAQIKYRYICHkM6wtkF00OeACDCS0K4wl6SNoOqAiYCOsESQo6AMAO/UbcSrFKowtfBwQK8wEFCrkI1QfcBV5HNEeMRuJG1QiqQsNC2SGEL7wDBQ07AsIGYgYSRuQWywetBUYIvQSBC34XDAqyFooZNA==")
const current_move_index = ref(0)
function NextMove() {
  if (current_move_index.value < move_array.length) {
    current_move.value.moves = new Uint16Array([move_array[current_move_index.value++]])
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
  if (current_move_index.value > 0)
    board_ref.value.UnmakeMove(move_array[--current_move_index.value], move_array[current_move_index.value - 1])
}
function Advance(event) {
  if (event.key === "ArrowRight") NextMove()
  else if (event.key === "ArrowLeft") PreviousMove()
  else if (event.key === "Tab") {
    FlipWatch()
    event.stopPropagation()
    event.preventDefault()
  }
}
document.addEventListener("keydown", Advance)
onBeforeUnmount(() => {
  document.removeEventListener("keydown", Advance)
})
</script>

<template>
  <Board ref="board_ref" @change-side="ChangeSide" :side="sideToView" :side-to-move="sideToMove" :pos="FENStart" :legal-moves="current_move" :replaying="true"/>
  <button @click="NextMove">Advance</button>
  <button @click="PreviousMove">Reverse</button>
  <button @click="FlipWatch">Flip side</button>
</template>

<style scoped>

</style>