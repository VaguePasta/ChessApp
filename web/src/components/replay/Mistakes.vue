<script setup>
import {GetTargetSquare} from "@/components/game/js/Moves.js";
import {ref, watch} from "vue";

const props = defineProps(['mistake', 'position', 'side'])
const mistake = ref(props.mistake)
let pos = GetTargetSquare(props.position)
let positionLeft = ref(!props.side ? ((pos % 8 + 1) * 12.5) - 2 + '%' : 98 - (pos % 8) * 12.5 + '%');
let positionTop = ref(!props.side ? Math.floor(pos / 8) * 12.5 - 1 + '%' : 99 - Math.floor(pos / 8 + 1) * 12.5 + '%');
watch(props, (prop) => {
  if (!prop.mistake) return
  mistake.value = props.mistake
  let newPosition = GetTargetSquare(props.position)
  positionLeft.value = !props.side ? ((newPosition % 8 + 1) * 12.5) - 2 + '%' : 98 - (newPosition % 8) * 12.5 + '%'
  positionTop.value = !props.side ? Math.floor(newPosition / 8) * 12.5 - 1 + '%' : 99 - Math.floor(newPosition / 8 + 1) * 12.5 + '%'
})
</script>

<template>
  <div style="aspect-ratio: 1/1; height: 90vh; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);">
    <div v-if="props.mistake" class="mistaken">{{props.mistake === '#56b4e9' ? '?!' : (props.mistake === '#e69f00' ? '?' : '??')}}</div>
  </div>
</template>

<style scoped>
.mistaken {
  position: absolute;
  width: 4%;
  height: 4%;
  border-radius: 50%;
  background-color: v-bind(mistake);
  border: none;
  color: white;
  text-align: center;
  font-family: gilroy-bold, sans-serif;
  font-size: 3vh;
  user-select: none;
  box-shadow: rgba(0, 0, 0, 0.19) 0 10px 20px, rgba(0, 0, 0, 0.23) 0 6px 6px;
  left: v-bind(positionLeft);
  top: v-bind(positionTop);
}
</style>