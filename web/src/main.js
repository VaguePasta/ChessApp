import { createApp } from 'vue'
import App from "./App.vue";
import Dashboard from "@/components/auth/Dashboard.vue";
import Game from "@/components/board/Game.vue";
import {createRouter, createWebHistory} from "vue-router";
import Login from "@/components/auth/Login.vue";
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
createApp(App).use(router).mount('body')