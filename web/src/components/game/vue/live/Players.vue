<script setup>
import {ref, watch} from "vue";
import {Username} from "@/connection/connections.js";
const resigning = ref(false)
const props = defineProps(['opponent', 'side', 'bot', 'elo', 'sideToMove'])
const emit = defineEmits(['resign'])
function Resign() {
  emit('resign')
}
</script>

<template>
  <div class="game-info">
    <div style="border-bottom: 1px groove white" class="player">{{props.opponent}}
      <div style="color: #b62fc5" v-if="Number(props.bot)">BOT</div>
      <div style="font-size: 20px" v-if="Number(props.bot)">Elo: {{props.elo}}</div>
    </div>
    <div class="player">
      <button :disabled="props.sideToMove !== props.side" @click="resigning = true" class="resign-button">Resign</button>
      <div style="margin-top: auto">{{Username}}</div>
    </div>
    <div class="resign-popup" v-if="resigning">Are you sure you want to resign?
      <div style="margin-top: 4%; width: 50%; align-self: center; display: flex; justify-content: space-evenly">
        <button @click="Resign" class="confirm">Yes</button>
        <button @click="resigning = false" class="confirm decline">No</button>
      </div>
    </div>
    <div @click="resigning = false" class="screen-mask" v-if="resigning"></div>
  </div>
</template>

<style scoped>
@import "../../../dashboard/styles/UI.css";
.game-info {
  height: 40%;
  width: 20%;
  border-radius: 10%;
  padding: 3% 1%;
  display: flex;
  flex-direction: column;
  background-color: #082c3a;
  justify-content: space-between;
  align-items: center;
}
.player {
  color: white;
  font-family: gilroy-bold, sans-serif;
  text-align: center;
  font-size: 25px;
  width: 100%;
  height: 50%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.resign-button {
  background-color: #DC143C;
  border-radius: 12px;
  color: white;
  border: none;
  font-size: 22px;
  padding: 2%;
  margin-top: auto;
  width: 75%;
  align-self: center;
  font-family: gilroy-bold, sans-serif;
}
.resign-button:hover {
  background-color: orangered;
}
.resign-button:disabled {
  background-color: gray;
  color: white;
}
.resign-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  border-radius: 12px;
  font-family: gilroy-bold, sans-serif;
  background-color: #082c3a;
  color: white;
  padding: 3%;
  font-size: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: zoom-in 0.2s;
}
.confirm {
  margin: 2%;
  font-size: 18px;
  font-family: gilroy-bold, sans-serif;
  padding: 3% 6%;
  width: 40%;
  background-color: gray;
  border: none;
  border-radius: 6px;
}
.confirm:hover {
  color: white;
  background-color: red;
}
.decline:hover {
  background-color: lightslategray;
}
.screen-mask {
  opacity: 0.4;
  background-color: black;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
  transform: none;
}
</style>