<script setup lang="ts">
  import {ref} from "vue";
  import {GetTargetSquare} from "@/components/board/Moves.js";
  const props = defineProps(['move', 'side'])
  const top = ref(props.side ? 3.125 + (12.5 * Math.floor((63 - GetTargetSquare(props.move)) / 8)) + '%' : 3.125 + (12.5 * Math.floor(GetTargetSquare(props.move) / 8)) + '%')
  const left = ref(props.side ? 3.125 + (12.5 * ((63 - GetTargetSquare(props.move)) % 8)) + '%' : 3.125 + (12.5 * (GetTargetSquare(props.move) % 8)) + '%')
</script>

<template>
  <div class="move-position move-pointer"/>
</template>

<style scoped>
.move-position {
  left: v-bind(left);
  top: v-bind(top);
}
.move-pointer {
  margin: 0;
  position: absolute;
  width: 6.25%;
  max-width: 6.25%;
  aspect-ratio: 1/1;
  pointer-events: none;
  background-color: lightslategray;
  border-radius: 50%;
  opacity: 0.7;
}
</style>