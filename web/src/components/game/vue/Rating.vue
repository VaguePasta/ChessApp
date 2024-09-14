<script setup>
const props = defineProps(['win', 'draw', 'lose'])
</script>

<template>
<div class="rate-graph">
  <div class="win-chance"/>
  <div class="draw-change"/>
  <div class="lose-chance"/>
</div>
</template>

<style scoped>
.rate-graph {
  display: flex;
  flex-direction: column;
  min-height: 90%;
  width: 5vw;
}
.win-chance {
  width: 100%;
  height: 75%;
  background-color: white;
}
.draw-change {
  width: 100%;
  height: 10%;
  background-color: grey;
}
.lose-chance {
  width: 100%;
  background-color: black ;
  flex-grow: 1;
}
</style>