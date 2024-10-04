<script setup>
import {User} from "@/connection/connections.js";
import Chart from "@/components/dashboard/Chart.vue";
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
    <button style="margin-top: auto" @click="Logout">Log out</button>
  </div>
</template>

<style scoped>
@import "styles/UI.css";
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