<script setup>
import {ref, watch} from "vue";
const props = defineProps(['rating', 'side', 'analyzed'])
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
  <div v-if="!props.analyzed" class="loading">
    <div class="loader"/>
  </div>
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
.loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  background-color: lightgray;
  display: flex;
  align-items: center;
  justify-content: center;
}
.loader {
  width: 155%;
  aspect-ratio: 4;
  --_g: no-repeat radial-gradient(circle closest-side,#000 90%,#0000);
  background:
      var(--_g) 0   50%,
      var(--_g) 50%  50%,
      var(--_g) 100% 50%;
  background-size: calc(100%/3) 100%;
  animation: l7 1s infinite linear;
  transform: rotate(90deg);
}
@keyframes l7 {
  33%{background-size:calc(100%/3) 0, calc(100%/3) 100%, calc(100%/3) 100%}
  50%{background-size:calc(100%/3) 100%, calc(100%/3) 0, calc(100%/3) 100%}
  66%{background-size:calc(100%/3) 100%, calc(100%/3) 100%, calc(100%/3) 0}
}
</style>