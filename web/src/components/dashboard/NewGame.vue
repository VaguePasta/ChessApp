<script setup>
import {ref} from "vue";
import {ConnectToServer, SessionID, SetSessionID} from "@/connection/connections.js";
import {websocket, WebSocketConnect} from "@/connection/websocket.js";
import {useRouter} from "vue-router";
const finding = ref(false)
const gameToken = ref(null)
const waiting = ref(false)
const router = useRouter()
function FindMatch() {
  WebSocketConnect("match")
  finding.value = true
  websocket.onclose = async () => {
    SetSessionID(null)
    await ConnectToServer()
    if (!SessionID) {
      finding.value = false
      await router.push("/")
    }
    else FindMatch()
  }
  websocket.onmessage = (token) => {
    gameToken.value = token.data
    finding.value = false
  }
}
function AcceptMatch() {
  WebSocketConnect("game/" + gameToken.value)
  websocket.onopen = () => {
    waiting.value = true
  }
  websocket.onmessage = (ok) => {
    if (ok.data === "ok") {
      websocket.onmessage = (config) => {
        finding.value = false
        router.push({path: "/game", query: {p: config.data.slice(0, -1), g: config.data[config.data.length - 1], b: 0}})
      }
    }
    else if (ok.data === "Match cancelled.") {
      websocket.onclose = () => {}
      waiting.value = false
      gameToken.value = null
      websocket.close()
    }
  }
  gameToken.value = null
}
function StopSearch() {
  websocket.onclose = () => {}
  finding.value = false
  websocket.close()
}
function RefuseMatch() {
  websocket.onclose = () => {}
  websocket.send("Refused.")
  gameToken.value = null
  websocket.close()
}
function QuitWaiting() {
  waiting.value = false
  websocket.close()
}
function NewBotMatch() {
  WebSocketConnect("bot/" + SessionID + "/1")
  websocket.onclose = async () => {
    SetSessionID(null)
    await ConnectToServer()
    if (!SessionID) {
      finding.value = false
      await router.push("/")
    } else NewBotMatch()
  }
  websocket.onmessage = (ok) => {
    if (ok.data === "ok") {
      websocket.onmessage = (config) => {
        finding.value = false
        router.push({path: "/game", query: {p: config.data.slice(0, -1), g: 1, b: 1}})
      }
    }
  }
}
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
  <div v-if="finding" class="new-popup">
    <div style="display: flex; align-items: center; justify-content: center; flex-direction: column">
      <div class="finding-loader"/>
      <div style="padding: 5px">Finding opponent...</div>
      <button @mousemove="HoverFindMatch" @click="StopSearch" class="pick-button">Quit searching</button>
    </div>
  </div>
  <div v-if="finding" class="new-mask"/>
  <div v-if="gameToken !== null" class="new-popup">
    <div style="display: flex; align-items: center; justify-content: center; flex-direction: column">
      <div style="padding: 5px">Opponent found. Enter match?</div>
      <button @mousemove="HoverFindMatch" @click="AcceptMatch" class="pick-button">Yes</button>
      <button @mousemove="HoverFindMatch" @click="RefuseMatch" class="pick-button">No</button>
    </div>
  </div>
  <div v-if="waiting" class="new-popup">
    <div style="padding: 5px">Waiting for opponent...</div>
    <button @click="QuitWaiting" class="pick-button">Quit waiting.</button>
  </div>
  <div style="display: flex; width: 33.33%; height: 100%; align-items: center; flex-direction: column">
    <button @mousemove="HoverFindMatch" class="find-match" @click="FindMatch">Find match</button>
    <button @mousemove="HoverFindMatch" class="find-match" @click="NewBotMatch">Practice against computer</button>
  </div>
</template>

<style scoped>
.new-popup {
  background-color: #082c3a;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: fit-content;
  height: fit-content;
  border-radius: 10px;
  padding: 2.5vw;
  box-sizing: border-box;
  border: 2px solid #ad965e;
  z-index: 3;
  animation: zoom-in 0.2s;
  font-family: gilroy-bold, sans-serif;
  font-size: 1.5vw;
}
@keyframes zoom-in {
  from {
    transform: scale(0.9, 0.9) translate(-55.6%, -55.6%);
  }
  to {
    transform: scale(1, 1) translate(-50%, -50%);
  }
}
.pick-button {
  background-color: #2d3339;
  border: 2px solid #ad965e;
  padding: 10px;
  margin: 1vw 5px 5px 5px;
  font-family: gilroy-bold, sans-serif;
  font-size: 1.2vw;
  border-radius: 5px;
  color: white;
}
.pick-button:hover {
  background: v-bind(hover);
}
.pick-button:active {
  background: v-bind(active);
}
.new-mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2;
}
.find-match {
  color: white;
  background-color: #1e2327;
  width: 45%;
  margin: 5%;
  padding: 5%;
  font-size: 3vh;
  border-radius: 3vh;
  font-family: gilroy-bold, sans-serif;
  border: 2px solid #b1a27f;
}
.find-match:hover {
  background: v-bind(hover);
}
.find-match:active {
  background: v-bind(active)
}
.finding-loader {
  width: 3.26vw;
  aspect-ratio: 1;
  display: grid;
  color: #ad965e;
  background: radial-gradient(farthest-side, currentColor calc(100% - 0.391vw),#0000 calc(100% - 0.326vw));
  mask: radial-gradient(farthest-side,#0000 calc(100% - 0.846vw),#000 calc(100% - 0.78125vw));
  border-radius: 50%;
  animation: l19 2s infinite linear;
}
.finding-loader::before,
.finding-loader::after {
  content: "";
  grid-area: 1/1;
  background:
      linear-gradient(currentColor 0 0) center,
      linear-gradient(currentColor 0 0) center;
  background-size: 100% 0.651vw, 0.651vw 100%;
  background-repeat: no-repeat;
}
.finding-loader::after {
  transform: rotate(45deg);
}

@keyframes l19 {
  100%{transform: rotate(1turn)}
}
</style>