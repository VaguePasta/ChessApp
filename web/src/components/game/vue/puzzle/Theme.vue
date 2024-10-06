<script setup>
import {onBeforeMount, ref, watch} from "vue";
const props = defineProps(['themes'])
const themes = ref(null)
const themesDescription = ref([])
let document
onBeforeMount(async () => {
  let data = await fetch("assets/xml/puzzleTheme.xml")
  let xml = await data.text()
  document = new DOMParser().parseFromString(xml, 'text/xml')
  ReloadThemes()
})
watch(props, () => {
  ReloadThemes()
})
function ReloadThemes() {
  themes.value = props.themes.split(" ")
  themesDescription.value.length = 0
  themes.value.forEach((value) => {
    themesDescription.value.push({
      name: document.getElementById(value).textContent,
      description: document.getElementById(value + "Description").textContent
    })
  })
}
</script>

<template>
  <div class="puzzle-theme" v-for="theme in themesDescription">
    <div class="theme-title">
      {{theme.name}}
    </div>
    <div>
      {{theme.description}}
    </div>
  </div>
</template>

<style scoped>
.puzzle-theme {
  border-bottom: 1px solid white;
  padding: 3% 0;
}
.theme-title {
  font-size: 18px;
}
</style>