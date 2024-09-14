import { createApp } from 'vue'
import App from "./App.vue";
import Dashboard from "@/components/dashboard/Dashboard.vue";
import Game from "@/components/game/vue/Game.vue";
import {createRouter, createWebHistory} from "vue-router";
import Login from "@/components/auth/Login.vue";
import {ConnectToServer} from "@/connection/connections.js";
const routes = [
    { path: '/game', component: Game, props: route => ({side : parseInt(route.query.g), pos: route.query.p, bot: route.query.b})},
    { path: '/dashboard', component: Dashboard},
    { path: '/', component: Login},
    { path: '/:pathMatch(.*)*', redirect: "/"}
]
const router = createRouter({
    history: createWebHistory(),
    routes,
})
ConnectToServer().then(() => createApp(App).use(router).mount('#app'))