import { createApp } from 'vue'
import App from "./App.vue";
import Dashboard from "@/components/dashboard/Dashboard.vue";
import Game from "@/components/game/vue/live/Game.vue";
import Puzzle from "@/components/game/vue/puzzle/Puzzle.vue";
import {createRouter, createWebHistory} from "vue-router";
import Login from "@/components/auth/Login.vue";
import {ConnectToServer} from "@/connection/connections.js";
import Replayer from "@/components/game/vue/replay/Replayer.vue";
const routes = [
    { path: '/game', component: Game, props: route => ({pos: route.query.p, bot: route.query.b, opponent: route.query.o, elo: route.query.e})},
    { path: '/dashboard', component: Dashboard},
    { path: '/', component: Login},
    { path: '/replay', component: Replayer, props: route => ({id: route.query.id})},
    { path: '/puzzle', component: Puzzle, props: route => ({fen: atob(route.query.f), moves: atob(route.query.m), rating: route.query.r})},
    { path: '/:pathMatch(.*)*', redirect: "/"}
]
export const router = createRouter({
    history: createWebHistory(),
    routes,
})
ConnectToServer(true).then(() => createApp(App).use(router).mount('#app'))