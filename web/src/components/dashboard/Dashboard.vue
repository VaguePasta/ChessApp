<script setup>
  import {useRouter} from "vue-router";
  import {onBeforeMount} from "vue";
  import {ConnectToServer, server, SessionID, SetSessionID} from "@/connection/connections.js";
  import NewGame from "@/components/auth/NewGame.vue";
  const router = useRouter()
  onBeforeMount(async () => {
    if (!SessionID) {
      await ConnectToServer()
      if (!SessionID) await router.push("/")
    }
  })
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
  <div style="display: flex">
    <div style="display: flex; width: 33.33%; height: 100%;">
      <div>Todo</div>
    </div>
    <NewGame/>
    <div style="display: flex; width: 33.33%; height: 100%;">
      <button @click="Logout">Log out</button>
    </div>
  </div>
</template>

<style scoped>
</style>