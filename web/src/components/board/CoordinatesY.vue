<script setup lang="ts">
  const props = defineProps(['side'])
</script>

<template>
  <div class="coordinate" style="width: 10vh; height: 90vh; position: absolute; display: flex; flex-direction: column; top: 50%; align-items: center">
    <div style="height: 11.25vh; display: flex; align-items: center; font-size: 2.5vh;">{{!props.side ? 1: 8}}</div>
    <div style="height: 11.25vh; display: flex; align-items: center; font-size: 2.5vh;">{{!props.sideside ? 2: 7}}</div>
    <div style="height: 11.25vh; display: flex; align-items: center; font-size: 2.5vh;">{{!props.side ? 3: 6}}</div>
    <div style="height: 11.25vh; display: flex; align-items: center; font-size: 2.5vh;">{{!props.side ? 4: 5}}</div>
    <div style="height: 11.25vh; display: flex; align-items: center; font-size: 2.5vh;">{{!props.side ? 5: 4}}</div>
    <div style="height: 11.25vh; display: flex; align-items: center; font-size: 2.5vh;">{{!props.side ? 6: 3}}</div>
    <div style="height: 11.25vh; display: flex; align-items: center; font-size: 2.5vh;">{{!props.side ? 7: 2}}</div>
    <div style="height: 11.25vh; display: flex; align-items: center; font-size: 2.5vh;">{{!props.side ? 8: 1}}</div>
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