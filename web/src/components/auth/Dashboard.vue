<script setup>
  import {useRouter} from "vue-router";
  import {websocket, WebSocketConnect} from "@/connection/websocket.js";
  import {onBeforeMount, ref} from "vue";
  import {server, SessionID, SetSessionID} from "@/connection/connections.js";
  const finding = ref(false)
  const router = useRouter()
  const gameToken = ref(null)
  const waiting = ref(false)
  onBeforeMount(() => {
    if (!SessionID) {
      router.push("/")
    }
  })
  function Login() {
    WebSocketConnect("match")
    websocket.onopen = () => {
      finding.value = true
    }
    websocket.onclose = () => {
      finding.value = false
    }
    websocket.onmessage = (token) => {
      gameToken.value = token.data
    }
  }
  function AcceptMatch() {
    WebSocketConnect("game/" + gameToken.value)
    websocket.onopen = () => {
      finding.value = false
      waiting.value = true
    }
    websocket.onmessage = (ok) => {
      if (ok.data === "ok") {
        websocket.onmessage = (config) => {
          finding.value = false
          router.push({path: "/game", query: {p: config.data.slice(0, -1), g: config.data[config.data.length - 1]}})
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
    websocket.close()
  }
  function RefuseMatch() {
    websocket.send("Refused.")
    gameToken.value = null
    websocket.close()
  }
  function QuitWaiting() {
    waiting.value = false
    websocket.close()
  }
  function Logout() {
    fetch(server + "logout", {
      method: 'POST',
      credentials: "include",
      body: SessionID,
    }).then((res) => {
      if (res.ok) {
        SetSessionID(null)
        router.push("/")
      }
    })
  }
</script>

<template>
  <div>
    <div v-if="finding" class="new-popup">
      <div style="display: flex; align-items: center; justify-content: center; flex-direction: column">
        <div style="padding: 5px">Finding opponent...</div>
        <button @click="StopSearch" class="pick-button">Quit searching</button>
      </div>
    </div>
    <div v-if="finding" class="new-mask"/>
    <div v-if="gameToken !== null" class="new-popup">
      <div style="display: flex; align-items: center; justify-content: center; flex-direction: column">
        <div style="padding: 5px">Opponent found. Enter match?</div>
        <button @click="AcceptMatch" class="pick-button">Yes</button>
        <button @click="RefuseMatch" class="pick-button">No</button>
      </div>
    </div>
    <div v-if="waiting" class="new-popup">
      <div style="padding: 5px">Waiting for opponent...</div>
      <button @click="QuitWaiting" class="pick-button">Quit waiting.</button>
    </div>
    <button @click="Login">New game</button>
    <button @click="Logout">Log out</button>
  </div>
</template>

<style scoped>
.new-popup {
  background-color: #79796a;
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
  border-radius: 10px;
  padding: 15px;
  box-sizing: border-box;
  border: 1px solid black;
  font-family: "Open Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
  font-variation-settings: "wdth" 100;
  z-index: 3;
  animation: zoom-in 0.2s
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
  background-color: #81b64c;
  border: none;
  padding: 10px;
  margin: 5px;
  font-family: "Open Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
  font-variation-settings: "wdth" 100;
  font-size: 16px;
  border-radius: 5px;
}
.pick-button:hover {
  background-color: #a3d160;
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
</style>