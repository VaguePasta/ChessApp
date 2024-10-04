<script setup>
  import {ref} from "vue";
  import {GetTargetSquare, GetMoveFlag} from "../../js/Moves.js";
  const props = defineProps(['move', 'side'])
  let flag = GetMoveFlag(props.move)
  let isCapture = flag === 4 || flag === 12 || flag === 13 || flag === 14 || flag === 15
  let _top, _left
  if (!isCapture) {
    _top = props.side ? 3.75 + (12.5 * Math.floor((63 - GetTargetSquare(props.move)) / 8)) + '%' : 3.75 + (12.5 * Math.floor(GetTargetSquare(props.move) / 8)) + '%'
    _left = props.side ? 3.75 + (12.5 * ((63 - GetTargetSquare(props.move)) % 8)) + '%' : 3.75 + (12.5 * (GetTargetSquare(props.move) % 8)) + '%'
  }
  else {
    _top = props.side ? (12.5 * Math.floor((63 - GetTargetSquare(props.move)) / 8)) + '%' : (12.5 * Math.floor(GetTargetSquare(props.move) / 8)) + '%'
    _left = props.side ? (12.5 * ((63 - GetTargetSquare(props.move)) % 8)) + '%' : (12.5 * (GetTargetSquare(props.move) % 8)) + '%'
  }
  const top = ref(_top)
  const left = ref(_left)
</script>

<template>
  <div class="move-position" :class="isCapture ? 'move-pointer-capture' : 'move-pointer-non-capture'"/>
</template>

<style scoped>
.move-position {
  left: v-bind(left);
  top: v-bind(top);
  box-sizing: border-box;
}
.move-pointer-non-capture {
  margin: 0;
  position: absolute;
  width: 5%;
  max-width: 5%;
  aspect-ratio: 1/1;
  pointer-events: none;
  background-color: #3d444d;
  border-radius: 50%;
  opacity: 0.6;
}
.move-pointer-capture {
  margin: 0;
  position: absolute;
  width: 12.5%;
  max-width: 12.5%;
  aspect-ratio: 1/1;
  pointer-events: none;
  border: 0.475cqw solid #3d444d;
  background-color: transparent;
  border-radius: 50%;
  opacity: 0.6;
  z-index: 1;
}
</style>