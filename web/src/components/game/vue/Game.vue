<script setup>
import {onBeforeMount, ref} from "vue";
  import {websocket} from "@/connection/websocket.js";
  import Board from "@/components/game/vue/Board.vue";
  import {useRouter} from "vue-router";
  import {ExtractSideToMove} from "@/components/game/js/FEN.js";
  const result = ref(null)
  const connectionLost = ref(null)
  const legalMoves = ref([])
  const props = defineProps(['pos', 'bot'])
  const router = useRouter()
  const information = atob(props.pos)
  const sideToMove = ref(ExtractSideToMove(information.slice(0, -1)))
  const sounds = ref([
    new Audio("/assets/sounds/win.mp3"),
    new Audio("/assets/sounds/lose.mp3"),
    new Audio("/assets/sounds/draw.mp3"),
  ])
  onBeforeMount(() => {
    if (!websocket) router.push("/dashboard")
    else {
      websocket.addEventListener('close', lostConnection)
      if (parseInt(information[information.length - 1]) === sideToMove.value) {
        websocket.onmessage = (msg) => {
          legalMoves.value = new Uint16Array([0, ...new Uint16Array(msg.data)])
          defineOnMessage()
        }
      } else {
        defineOnMessage()
      }
      websocket.send("ok")
    }
  })
  function defineOnMessage() {
    websocket.onmessage = (msg) => {
      if (typeof msg.data === "string") {
        websocket.removeEventListener('close', lostConnection)
        if (msg.data === "The other player has lost connection.") {
          connectionLost.value = msg.data
          return
        }
        result.value = msg.data.toString()
        if (parseInt(information[information.length - 1]) === sideToMove.value) sideToMove.value = 1 - sideToMove.value
        if (msg.data.toString() === "You won.") {
          sounds.value[0].play()
        } else if (msg.data.toString() === "You lost.") {
          sounds.value[1].play()
        } else {
          sounds.value[2].play()
        }
      }
      else {
        if (sideToMove.value !== parseInt(information[information.length - 1])) {
          legalMoves.value = new Uint16Array(msg.data)
        }
      }
    }
  }
  function lostConnection() {
    connectionLost.value = "Connection lost."
  }
  function returnToMenu() {
    router.push({path : "/dashboard"})
  }
  function ChangeSide() {
    sideToMove.value = 1 - sideToMove.value
  }
</script>

<template>
  <div style="position: absolute; aspect-ratio: 1/1; height: 90%; left: 50%; top: 50%; transform: translate(-50%, -50%)">
    <Board @change-side="ChangeSide" :side="parseInt(information.slice(-1))" :sideToMove="sideToMove" :pos="information.slice(0, -1)" :legalMoves="legalMoves"/>
    <div v-if="result" class="end-popup">
      <div style="font-size: 3.2vh; padding-bottom: 1vh;">The game has concluded.</div>
      <div style="font-size: 3vh; padding-bottom: 1vh;">{{result}}</div>
      <button @click="returnToMenu" class="end-button">Back to main menu</button>
    </div>
    <div v-if="result" class="modal-mask"/>
    <div v-if="connectionLost" class="end-popup">
      <div style="font-size: 3.2vh; padding-bottom: 1vh;">{{connectionLost}}</div>
      <button @click="returnToMenu" class="end-button">Back to main menu.</button>
    </div>
  </div>
</template>

<style scoped>
.end-button {
  background-color: #81b64c;
  border: none;
  padding: 1vh;
  font-family: gilroy-regular, sans-serif;
  font-size: 2.5vh;
  border-radius: 5px;
}
.end-button:hover {
  background-color: #a3d160;
}
.end-popup {
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
  z-index: 5;
  width: 30vw;
  height: 18vh;
  border-radius: 10px;
  padding: 15px;
  box-sizing: border-box;
  border: 1px solid black;
  font-family: gilroy-regular, sans-serif;
  animation: zoom-in 0.2s;
  font-size: 17px;
}
@keyframes zoom-in {
  from {
    transform: scale(0.9, 0.9) translate(-55.6%, -55.6%);
  }
  to {
    transform: scale(1, 1) translate(-50%, -50%);
  }
}
.modal-mask {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 3;
  top: 0;
}
</style>