import { createApp } from 'vue'
import App from "./App.vue";
import LogIn from "@/components/auth/LogIn.vue";
import Game from "@/components/board/Game.vue";
import {createMemoryHistory, createRouter} from "vue-router";
const routes = [
    { path: '/game', component: Game, props: route => ({side : parseInt(route.query.g.slice(-1))})},
    { path: '/login', component: LogIn },
    { path: '/', component: LogIn}
]
const router = createRouter({
    history: createMemoryHistory(),
    routes,
})
createApp(App).use(router).mount('#app')