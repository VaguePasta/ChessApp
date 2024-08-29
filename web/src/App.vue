<script setup>
import Game from "@/components/board/Game.vue";
const side = 0b01
</script>

<template>
  <div>
    <Game :side="side"/>
  </div>
</template>

<style scoped>

</style>
