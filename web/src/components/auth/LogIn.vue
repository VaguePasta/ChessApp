<script setup>
  import {useRouter} from "vue-router";
  import {LogIn} from "@/connection/login.ts";
  import {gameToken, server, setGameToken, websocket, WebSocketConnect} from "@/connection/websocket.ts";

  const router = useRouter()
  function Login() {
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
          WebSocketConnect(gameData[0])
          websocket.onopen = () => {
            setGameToken(gameData[0])
            router.push({path: "/game", query: {g: gameToken, p: gameData[1]}})
          }
        })
      }
    })
  }
</script>

<template>
  <div>
    <button @click="Login">Log in</button>
  </div>
</template>

<style scoped>

</style>