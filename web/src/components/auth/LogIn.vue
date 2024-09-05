<script setup>
  import {useRouter} from "vue-router";
  import {LogIn} from "@/connection/login.ts";
  import {gameToken, server, setGameToken, websocket, WebSocketConnect} from "@/connection/websocket.ts";
  import {ref} from "vue";
  const side = ref("")
  const askSide = ref(false)
  const router = useRouter()
  function Login() {
    if (side.value === "") {
      askSide.value = true
      return
    }
    let ok = LogIn()
    if (!ok) return
    fetch(server + 'new', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: ""
    }).then((res) => {
      if (res.ok) {
        res.text().then((data) => {
          let gameData = JSON.parse(data)
          WebSocketConnect(gameData[0] + side.value)
          websocket.onopen = () => {
            setGameToken(gameData[0])
            router.push({path: "/game", query: {g: side.value, p: gameData[1]}})
          }
        })
      }
    })
  }
  function whiteClick() {
    side.value = "0"
    askSide.value = false
    Login()
  }
  function blackClick() {
    side.value = "1"
    askSide.value = false
    Login()
  }
</script>

<template>
  <div>
    <div v-if="askSide" class="new-popup">
      <div style="padding-bottom: 10px">Do you want to play as:</div>
      <div style="display: flex; align-items: center; justify-content: center">
        <button @click="whiteClick" class="pick-button white">White</button>
        <div style="padding: 5px">or</div>
        <button @click="blackClick" class="pick-button black">Black</button>
      </div>
    </div>
    <div v-if="askSide" class="new-mask"/>
    <button @click="Login">Log in</button>
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
.white:hover {
  background-color: white;
  color: black;
}
.black:hover {
  background-color: black;
  color: white;
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