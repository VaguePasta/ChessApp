<script setup>
import {User} from "@/connection/connections.js";
import Chart from "@/components/dashboard/Chart.vue";
import {ref} from "vue";
const hover = ref("")
const active = ref("")
function HoverFindMatch(e) {
  let rect = e.target.getBoundingClientRect()
  hover.value = "radial-gradient(circle at "
      + ((e.clientX - rect.x)/rect.width * 100).toFixed(0) + "% "
      + ((e.clientY - rect.y)/rect.height * 100).toFixed(0)
      + "%, #ad965e, #1e2327)"
  active.value = "radial-gradient(circle at " +
      ((e.clientX - rect.x)/rect.width * 100).toFixed(0) + "% "
      + ((e.clientY - rect.y)/rect.height * 100).toFixed(0)
      + "%, #ad965e 0, #1e2327 150%)"
}
</script>

<template>
  <div class="outer">
    <div class="user-box">
    <div>
      {{User.username}}
    </div>
    <div>Member since: {{new Date(User.joined).toLocaleDateString("en-UK")}}</div>
    <div>Match history: {{User.win}} win(s), {{User.draw}} draw(s), {{User.loss}} loss(es).</div>
    </div>

    <div class="user-chart-box">
      <Chart/>
    </div>
    <button @mousemove="HoverFindMatch" class="pick-button" @click="Logout">Log out</button>
  </div>
</template>

<style scoped>
@import "styles/UI.css";
.pick-button:hover {
  background: v-bind(hover);
}
.pick-button:active {
  background: v-bind(active);
}
.user-chart-box {
  width: 80%;
  padding: 2% 0;
  height: 40%;
  border: 2px solid #ad8463;
  border-radius: 12px;
  margin: 2%;
  background-color: #1e2327;
}
.user-box {
  background-color: #1e2327;
  height: 25%;
  width: 80%;
  color: white;
  font-family: gilroy-bold, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  border: 2px solid #ad8463;
  border-radius: 12px;
  margin: 2%;
}
</style>