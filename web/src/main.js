import { createApp } from 'vue'
import App from "./App.vue";
import Dashboard from "@/components/dashboard/Dashboard.vue";
import Game from "@/components/game/vue/live/Game.vue";
import {createRouter, createWebHistory} from "vue-router";
import Login from "@/components/auth/Login.vue";
import {ConnectToServer} from "@/connection/connections.js";
import Replayer from "@/components/game/vue/replay/Replayer.vue";
const routes = [
    { path: '/game', component: Game, props: route => ({pos: route.query.p, bot: route.query.b, opponent: route.query.o, elo: route.query.e})},
    { path: '/dashboard', component: Dashboard},
    { path: '/', component: Login},
    { path: '/replay', component: Replayer, props: route => ({id: route.query.id})},
    { path: '/:pathMatch(.*)*', redirect: "/"}
]
const router = createRouter({
    history: createWebHistory(),
    routes,
})
ConnectToServer().then(() => createApp(App).use(router).mount('#app'))