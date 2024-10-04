<script setup>
  import {useRouter} from "vue-router";
  import {onBeforeMount} from "vue";
  import {ConnectToServer, server, SessionID, SetSessionID} from "@/connection/connections.js";
  import NewGame from "@/components/dashboard/NewGame.vue";
  import Analyze from "@/components/dashboard/Analyze.vue";
  import User from "@/components/dashboard/User.vue";
  const router = useRouter()
  onBeforeMount(async () => {
    if (!SessionID) {
      await ConnectToServer(true)
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
  <div style="display: flex; min-width: 100%; min-height: 100%">
    <User/>
    <NewGame/>
    <Analyze/>
  </div>
</template>

<style scoped>
</style>