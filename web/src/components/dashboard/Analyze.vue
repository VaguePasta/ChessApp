<script setup>
import {ConnectToServer, server, SessionID, User} from "@/connection/connections.js";
import {Replays, SetReplays} from "@/components/dashboard/replays.js";
import {onBeforeMount, onMounted, onUnmounted, ref} from "vue";
import {useRouter} from "vue-router";
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
const router = useRouter()
const list = ref(Replays)
const times = ref([])
TimeAgo.addLocale(en)
const timeAgo = new TimeAgo("en-GB")
const timeouts = []
onBeforeMount(() => {
  Replays.forEach((value, index) => {
    let formatted = timeAgo.format(Date.parse(value.date), {getTimeToNextUpdate: true})
    times.value.push(formatted[0])
    timeouts.push(setTimeout(() => ResetTimeout(index), Math.min(formatted[1], 2147483647)))
  })
})
onMounted(GetList)
function GetList() {
  fetch(server + "records", {
    method: 'GET',
    headers: {
      'Authorization': SessionID,
      'Content-Type': 'application/json'
    },
    credentials: 'omit'
  }).then(async (res) => {
    if (res.ok) {
      res.json().then((json) => {
        SetReplays(json)
        list.value = Replays
        times.value.length = 0
        timeouts.forEach(value => {
          clearTimeout(value)
        })
        timeouts.length = 0
        Replays.forEach((value, index) => {
          let formatted = timeAgo.format(Date.parse(value.date), {getTimeToNextUpdate: true})
          times.value.push(formatted[0])
          timeouts.push(setTimeout(() => ResetTimeout(index), Math.min(formatted[1], 2147483647)))
        })
      })
    } else {
      await ConnectToServer(false)
      if (!SessionID) await router.push("/")
      else GetList()
    }
  })
}
function ResetTimeout(index) {
  let formatted = timeAgo.format(Date.parse(Replays[index].date), {getTimeToNextUpdate: true})
  times.value[index] = formatted[0]
  timeouts[index] = setTimeout(() => ResetTimeout(index), Math.min(formatted[1], 2147483647))
}
onUnmounted(() => {
  timeouts.forEach(value => {
    clearTimeout(value)
  })
  timeouts.length = 0
})
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
    if (white_side === User.username) {
      return 'color: limegreen'
    }
    else return 'color: orangered'
  }
  else if (win_side === 'black') {
    if (white_side !== User.username) {
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
      else {
        ConnectToServer(false).then(() => {
          if (SessionID)
            Replay(game_id)
          else router.push("/")
        })
      }
    })
  }
}
function MatchInfo(game) {
  let str = ""
  if (game.win_side !== "draw") {
    switch (game.win_side) {
      case 'white':
        if (game.white_player === User.username) str += "Won by "
        else str += "Lost by "
        break
      case 'black':
        if (game.black_player === User.username) str += "Won by "
        else str += "Lost by "
        break
    }
  }
  else str += "Drew by "
  switch(game.result) {
    case 'check':
      str += "checkmate."
      break
    case 'resign':
      str += "resignation."
      break
    case '50':
      str += "50 moves rule."
      break
    case '3':
      str += "threefold repetitions."
      break
    case 'mats':
      str += "insufficient material."
      break
    case 'stalemate':
      str = "Stalemate."
  }
  return str
}
</script>

<template>
  <div class="outer">
    <div class="top-tag">
      Past games:<button class="reload-games" @click="GetList"/>
    </div>
    <div class="game-list">
      <div @mousemove="HoverRecord" class="game-record" v-for="(game, index) in list" @click="Replay(game.game_id)" :key="game.game_id" :style="SetStyle(game.win_side, game.white_player)">
        <div style="max-width: 40%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; display: inline-block; pointer-events: none; user-select: none">
        {{game.white_player ? game.white_player : 'BOT'}} vs {{game.black_player ? game.black_player : 'BOT'}}
        </div>
        <div style="float: right; pointer-events: none; user-select: none; color: lightgray">
        {{times[index]}}
        </div>
        <div>{{MatchInfo(game)}}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "styles/UI.css";
.top-tag {
  font-family: gilroy-medium, sans-serif;
  color: white;
  width: 100%;
  overflow: scroll;
  scrollbar-width: none;
  padding: 1% 2% 0 1%;
  text-align: center;
  box-sizing: border-box;
  height: fit-content;
}
.reload-games {
  background-image: url("/assets/images/flip.svg");
  background-repeat: no-repeat;
  background-size: 100%;
  aspect-ratio: 1/1;
  background-color: #1e2327;
  height: 30px;
  float: right;
  border: 2px solid #ad8463;
  border-radius: 5px;
}
.reload-games:hover {
  background-color: #ad965e;
}
.game-list {
  flex: 1;
  width: 100%;
  overflow-y: scroll;
  font-family: gilroy-regular, sans-serif;
  scrollbar-width: thin;
  color: white;
}
.game-record {
  padding: 2%;
  margin: 1%;
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