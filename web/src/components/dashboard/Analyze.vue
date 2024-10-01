<script setup>
import {server, SessionID, Username} from "@/connection/connections.js";
import {Replays, SetReplays} from "@/components/dashboard/replays.js";
import {ref} from "vue";
import {useRouter} from "vue-router";
const router = useRouter()
const list = ref(Replays)
function GetList() {
  fetch(server + "records", {
    method: 'GET',
    headers: {
      'Authorization': SessionID,
      'Content-Type': 'application/json'
    },
    credentials: 'omit'
  }).then((res) => {
    if (res.ok) {
      res.json().then((json) => {
        SetReplays(json)
        list.value = Replays
      })
    }
  })
}
const hover = ref("")
const active = ref("")
function HoverRecord(e) {
  let rect = e.target.getBoundingClientRect()
  hover.value = "radial-gradient(circle at "
      + ((e.clientX - rect.x)/rect.width * 100).toFixed(0) + "% "
      + ((e.clientY - rect.y)/rect.height * 100).toFixed(0)
      + "%, #ad965e 0, #1e2327 75%)"
  active.value = "radial-gradient(circle at " +
      ((e.clientX - rect.x)/rect.width * 100).toFixed(0) + "% "
      + ((e.clientY - rect.y)/rect.height * 100).toFixed(0)
      + "%, #ad965e 0, #1e2327 150%)"
}
function SetStyle(win_side, white_side) {
  if (win_side === 'draw') return 'color: gray'
  else if (win_side === 'white') {
    if (white_side === Username) {
      return 'color: limegreen'
    }
    else return 'color: orangered'
  }
  else if (win_side === 'black') {
    if (white_side !== Username) {
      return 'color: limegreen'
    }
    else return 'color: orangered'
  }
  else return ""
}
function Replay(game_id) {
  let game = Replays.find((element) => element.game_id === game_id)
  if (game.moves) {
    router.push({path: "/replay", query: {id: game_id}})
  }
  else {
    fetch(server + "record/" + game_id, {
      method: 'GET',
      headers: {
        'Authorization': SessionID,
        'Content-Type': 'text/plain'
      },
      credentials: 'omit'
    }).then((res) => {
      if (res.ok) {
        res.text().then(text => {
          game.moves = text
          router.push({path: "/replay", query: {id: game_id}})
        })
      }
    })
  }
}
</script>

<template>
  <div style="display: flex; width: 33.33%; min-height: 100%; flex-direction: column;">
    <button @click="GetList">Get</button>
    <div style="font-family: gilroy-medium, sans-serif; color: white">Games played:</div>
    <div class="game-list">
      <div @mousemove="HoverRecord" class="game-record" v-for="game in list" @click="Replay(game.game_id)" :key="game.game_id" :style="SetStyle(game.win_side, game.white_player)">
        <div style="max-width: 40%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; display: inline-block; pointer-events: none; user-select: none">
        {{game.white_player ? game.white_player : 'BOT'}} vs {{game.black_player ? game.black_player : 'BOT'}}
        </div>
        <div style="float: right; pointer-events: none; user-select: none">
        {{new Date(game.date).toLocaleDateString("en-GB", {hour: "numeric", minute: "numeric", second: "numeric"})}}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-list {
  height: 60%;
  width: 100%;
  overflow-y: scroll;
  font-family: gilroy-regular, sans-serif;
  scrollbar-width: thin;
  color: white;
}
.game-record {
  padding: 2%;
  margin: 1px;
  border-radius: 10px;
  border: 1px solid #ad8463;
  background-color: #1e2327;
}
.game-record:hover {
  background: v-bind(hover);
}
.game-record:active {
  background: v-bind(active);
}
</style>