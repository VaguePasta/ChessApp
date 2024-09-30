<script setup>
import {onUpdated, ref} from "vue";
const container = ref(null)
const props = defineProps(['evaluation'])
onUpdated(() => {
  container.value.scrollTop = container.value.scrollHeight
})
</script>

<template>
  <div ref="container" style="scroll-behavior: smooth; white-space: pre-wrap; scrollbar-width: thin; overflow-y: scroll; font-size: 16px; height: 90%; flex-shrink: none; width: 100%; padding: 1% 3%; box-sizing: border-box">
    {{props.evaluation}}
  </div>
</template>

<style scoped>

</style>