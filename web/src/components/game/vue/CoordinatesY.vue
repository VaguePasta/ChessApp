<script setup>
  const props = defineProps(['side'])
</script>

<template>
  <div class="coordinate" style="top: -4.5%; height: 100%; position: absolute; display: flex; flex-direction: column; align-items: center">
    <div class="numbers">{{!props.side ? 8: 1}}</div>
    <div class="numbers">{{!props.side ? 7: 2}}</div>
    <div class="numbers">{{!props.side ? 6: 3}}</div>
    <div class="numbers">{{!props.side ? 5: 4}}</div>
    <div class="numbers">{{!props.side ? 4: 5}}</div>
    <div class="numbers">{{!props.side ? 3: 6}}</div>
    <div class="numbers">{{!props.side ? 2: 7}}</div>
    <div class="numbers">{{!props.side ? 1: 8}}</div>
  </div>
</template>

<style scoped>
.numbers {
  height: 12.5%; display: flex;
  align-items: center;
  font-size: 2.2vh;
}
.coordinate {
  font-family: "Open Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
  font-variation-settings: "wdth" 100;
  color: black;
  user-select: none;
}
</style>