<script setup>
import {ref, watch} from "vue";
const props = defineProps(['rating', 'side'])
const oldValueWin = ref(parseInt(props.rating.rate[0]) / 10 + "%")
const oldValueDraw = ref(parseInt(props.rating.rate[1]) / 10 + "%")
const oldValueLose = ref(parseInt(props.rating.rate[2]) / 10 + "%")
const valueWin = ref(parseInt(props.rating.rate[0]) / 10 + "%")
const valueDraw = ref(parseInt(props.rating.rate[1]) / 10 + "%")
const valueLose = ref(parseInt(props.rating.rate[2]) / 10 + "%")
const styles = ref(props.side ? ["background-color: white", "background-color: black; color: white"] : ["background-color: black; color: white", "background-color: white"])
watch(props.rating, (newRating) => {
  oldValueWin.value = valueWin.value
  oldValueDraw.value = valueDraw.value
  oldValueLose.value = valueLose.value
  valueWin.value =  parseInt(newRating.rate[0]) / 10 + "%";
  valueDraw.value = parseInt(newRating.rate[1]) / 10 + "%";
  valueLose.value = parseInt(newRating.rate[2]) / 10 + "%";
})
</script>

<template>
<div class="rate-graph">
  <div class="lose-chance" :style="styles[0]" :key="valueLose">
    {{(props.rating.rate[2] >= 10) ? props.rating.rate[2] / 10 + "%" : ""}}
  </div>

  <div class="draw-change" :key="valueDraw">
    {{(props.rating.rate[1] >= 10) ? props.rating.rate[1] / 10 + "%" : ""}}
  </div>

  <div class="win-chance" :style="styles[1]" :key="valueWin">
    {{(props.rating.rate[0] >= 10) ? props.rating.rate[0] / 10 + "%" : ""}}
  </div>
</div>
</template>

<style scoped>
.rate-graph {
  height: 90vh;
  width: 5vw;
  position: absolute;
  left: 10%;
  display: inline-block;
}
.win-chance {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-family: gilroy-medium, sans-serif;
  height: v-bind(valueWin);
  animation: change-win 0.5s;
}
@keyframes change-win {
  from {
    height: v-bind(oldValueWin);
  }
}
.draw-change {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: grey;
  font-family: gilroy-medium, sans-serif;
  height: v-bind(valueDraw);
  animation: change-draw 0.5s;
}
@keyframes change-draw {
  from {
    height: v-bind(oldValueDraw);
  }
}
.lose-chance {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-family: gilroy-medium, sans-serif;
  height: v-bind(valueLose);
  animation: change-lose 0.5s;
}
@keyframes change-lose {
  from {
    height: v-bind(oldValueLose);
  }
}
</style>