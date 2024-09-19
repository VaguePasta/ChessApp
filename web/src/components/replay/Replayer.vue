<script setup>
import {ref} from "vue";
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
const move_array = Base64ToUint16(props.record)
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
</script>

<template>
<Board @change-side="ChangeSide" :side="0" :side-to-move="sideToMove" :pos="FENStart" :legal-moves="current_move" :replaying="true"/>
  <button @click="NextMove">Next move</button>
</template>

<style scoped>

</style>