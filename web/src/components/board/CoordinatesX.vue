<script setup>
  const props = defineProps(['side'])
</script>

<template>
  <div class="coordinate" style="width: 90vh; height: 5vh; position: absolute; display: flex; left: 50%; transform: translateX(-50%)">
    <div style="width: 11.25vh; display: flex; justify-content: center; font-size: 2.5vh;">{{!props.side ? 'a': 'h'}}</div>
    <div style="width: 11.25vh; display: flex; justify-content: center; font-size: 2.5vh;">{{!props.side ? 'b': 'g'}}</div>
    <div style="width: 11.25vh; display: flex; justify-content: center; font-size: 2.5vh;">{{!props.side ? 'c': 'f'}}</div>
    <div style="width: 11.25vh; display: flex; justify-content: center; font-size: 2.5vh;">{{!props.side ? 'd': 'e'}}</div>
    <div style="width: 11.25vh; display: flex; justify-content: center; font-size: 2.5vh;">{{!props.side ? 'e': 'd'}}</div>
    <div style="width: 11.25vh; display: flex; justify-content: center; font-size: 2.5vh;">{{!props.side ? 'f': 'c'}}</div>
    <div style="width: 11.25vh; display: flex; justify-content: center; font-size: 2.5vh;">{{!props.side ? 'g': 'b'}}</div>
    <div style="width: 11.25vh; display: flex; justify-content: center; font-size: 2.5vh;">{{!props.side ? 'h': 'a'}}</div>
  </div>
</template>

<style scoped>
.coordinate {
  font-family: "Open Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
  font-variation-settings: "wdth" 100;
}
</style>