<script setup>
import {ref, watch} from "vue";
const props = defineProps(['rating', 'side'])
const oldvalueWhite = ref(props.rating.rate[0] + "%")
const oldvalueBlack = ref(props.rating.rate[1] + "%")
const valueWhite = ref(props.rating.rate[0] + "%")
const valueBlack = ref(props.rating.rate[1] + "%")
watch(props.rating, (newRating) => {
  oldvalueWhite.value = valueWhite.value
  oldvalueBlack.value = valueBlack.value
  valueWhite.value =  newRating.rate[0] + "%";
  valueBlack.value = newRating.rate[1] + "%";
})
</script>

<template>
<div class="rate-graph">
  <div :class="props.side ? 'white-chance' : 'black-chance'" :key="props.side ? valueWhite : valueBlack">
    {{(props.rating.rate[props.side ? 0 : 1] >= 6) ? props.rating.rate[props.side ? 0 : 1].toFixed(2) + "%" : ""}}
  </div>

  <div :class="props.side ? 'black-chance' : 'white-chance'" :key="props.side ? valueBlack : valueWhite">
    {{(props.rating.rate[props.side ? 1 : 0] >= 6) ? props.rating.rate[props.side ? 1 : 0].toFixed(2) + "%" : ""}}
  </div>
</div>
</template>

<style scoped>
.rate-graph {
  writing-mode: vertical-lr;
  color: black;
  height: 100%;
  font-size: 1rem;
  display: flex;
  flex: 1;
  transform: rotate(-180deg);
  flex-direction: row-reverse;
}
.white-chance {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-family: gilroy-medium, sans-serif;
  height: v-bind(valueWhite);
  animation: change-white 0.5s;
  background-color: white;
}
@keyframes change-white {
  from {
    height: v-bind(oldvalueWhite);
  }
}
.black-chance {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-family: gilroy-medium, sans-serif;
  height: v-bind(valueBlack);
  animation: change-black 0.5s;
  color: white;
  background-color: black;
}
@keyframes change-black {
  from {
    height: v-bind(oldvalueBlack);
  }
}
</style>