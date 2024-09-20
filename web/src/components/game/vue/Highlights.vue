<script setup>
import {ref, watch} from "vue";
const props = defineProps(['side', 'position'])
const left = ref(!props.side ? (props.position % 8) * 12.5 + '%' : 87.5 - (props.position % 8) * 12.5 + '%')
const top = ref(!props.side ? Math.floor(props.position / 8) * 12.5 + '%' : 87.5 - Math.floor(props.position / 8) * 12.5 + '%')
</script>

<template>
  <div class="square-highlighter"/>
</template>

<style scoped>
.square-highlighter {
  position: absolute;
  left: v-bind(left);
  top: v-bind(top);
  aspect-ratio: 1/1;
  background-color: rgb(255, 255, 51);
  width: 12.5%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.5;
}
</style>