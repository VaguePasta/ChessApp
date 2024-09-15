<script setup>
import {onBeforeMount, ref} from "vue";
  import {websocket} from "@/connection/websocket.js";
  import Board from "@/components/game/vue/Board.vue";
  import {useRouter} from "vue-router";
  import {ExtractSideToMove} from "@/components/game/js/FEN.js";
  import Rating from "@/components/game/vue/Rating.vue";
  const result = ref(null)
  const connectionLost = ref(null)
  const legalMoves = ref({moves: []})
  const props = defineProps(['side', 'pos', 'bot'])
  const router = useRouter()
  const sideToMove = ref(ExtractSideToMove(props.pos))
  const sounds = ref([
    new Audio("/sounds/win.mp3"),
    new Audio("/sounds/lose.mp3"),
    new Audio("/sounds/draw.mp3"),
  ])
  const rating = ref({rate: [333, 333, 333]})
  onBeforeMount(() => {
    if (!websocket) router.push("/dashboard")
    else {
      websocket.addEventListener('close', lostConnection)
      if (!props.side) {
        websocket.onmessage = (msg) => {
          legalMoves.value.moves = new Uint16Array(msg.data)
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
        if (props.side === sideToMove.value) sideToMove.value = 1 - sideToMove.value
        if (msg.data.toString() === "You won.") {
          sounds.value[0].play()
        } else if (msg.data.toString() === "You lost.") {
          sounds.value[1].play()
        } else {
          sounds.value[2].play()
        }
      }
      else {
        let moves = new Uint16Array(msg.data)
        if (props.bot === "1" && moves[0] === 0) {
          if (sideToMove.value !== props.side) {
            rating.value.rate = [moves[3], moves[2], moves[1]]
          }
          else {
            rating.value.rate = [moves[1], moves[2], moves[3]]
          }
        }
        else if (sideToMove.value !== props.side) {
          legalMoves.value.moves = new Uint16Array(msg.data)
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
  <div style="position: absolute; width:80%; height: 90vh; left: 50%; top: 50%; transform: translate(-50%, -50%)">
    <Rating v-if="parseInt(props.bot) === 1" :rating="rating" :side="props.side"/>
    <Board @change-side="ChangeSide" :side="props.side" :sideToMove="sideToMove" :pos="props.pos" :legalMoves="legalMoves"/>
    <div v-if="result" class="end-popup">
      <div style="font-size: 3.5vh; padding-bottom: 1vh;">The game has concluded.</div>
      <div style="font-size: 3vh; padding-bottom: 1vh;">{{result}}</div>
      <button @click="returnToMenu" class="end-button">Back to main menu</button>
    </div>
    <div v-if="result" class="modal-mask"/>
    <div v-if="connectionLost" class="end-popup">
      <div style="font-size: 3.5vh; padding-bottom: 1vh;">{{connectionLost}}</div>
      <button @click="returnToMenu" class="end-button">Back to main menu.</button>
    </div>
  </div>
</template>

<style scoped>
.end-button {
  background-color: #81b64c;
  border: none;
  padding: 1vh;
  font-family: "Open Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
  font-variation-settings: "wdth" 100;
  font-size: 2vh;
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
  font-family: "Open Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
  font-variation-settings: "wdth" 100;
  animation: zoom-in 0.2s;
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