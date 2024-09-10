<script setup>
  const props = defineProps(['side'])
</script>

<template>
  <div class="coordinate" style="width: 100%; position: absolute; display: flex; justify-content: center;">
    <div class="letters">{{!props.side ? 'a': 'h'}}</div>
    <div class="letters">{{!props.side ? 'b': 'g'}}</div>
    <div class="letters">{{!props.side ? 'c': 'f'}}</div>
    <div class="letters">{{!props.side ? 'd': 'e'}}</div>
    <div class="letters">{{!props.side ? 'e': 'd'}}</div>
    <div class="letters">{{!props.side ? 'f': 'c'}}</div>
    <div class="letters">{{!props.side ? 'g': 'b'}}</div>
    <div class="letters">{{!props.side ? 'h': 'a'}}</div>
  </div>
</template>

<style scoped>
.letters {
  width: 12.5%;
  display: flex;
  font-size: 2.2vh;
}
.coordinate {
  font-family: "Open Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
  font-variation-settings: "wdth" 100;
  color: black;
}
</style>