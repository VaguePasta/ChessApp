import { createApp } from 'vue'
import App from "./App.vue";
import Dashboard from "@/components/auth/Dashboard.vue";
import Game from "@/components/board/Game.vue";
import {createRouter, createWebHistory} from "vue-router";
import Login from "@/components/auth/Login.vue";
import {server, SetSessionID} from "@/connection/connections.js";
const routes = [
    { path: '/game', component: Game, props: route => ({side : parseInt(route.query.g), pos: route.query.p})},
    { path: '/dashboard', component: Dashboard},
    { path: '/', component: Login},
    { path: '/:pathMatch(.*)*', redirect: "/"}
]
const router = createRouter({
    history: createWebHistory(),
    routes,
})
let res = await fetch(server + 'auth', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams ({
        'type': 'login',
    })
})
if (res.ok) SetSessionID(await res.text())
createApp(App).use(router).mount('body')