<script setup>
import {ref, onBeforeMount} from "vue";
import {useRouter} from "vue-router";
import {server, SessionID, SetSessionID} from "@/connection/connections.js";
const router = useRouter()
const loginFail = ref(false)
const registerFail = ref(0)
const register = ref(false)
onBeforeMount(() => {
  if (SessionID) {
    router.push("/dashboard")
  }
})
function SignIn(username, password, remember) {
  if (!username || !password) return
  fetch(server + 'auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    credentials: "include",
    body: new URLSearchParams ({
      'type': 'login',
      'username': username,
      'password': password,
      'remember': remember ? "true" : "false"
    })
  }).then((res) => {
    if (res.ok) {
      res.text().then((data) => {
        SetSessionID(data)
        router.push("/dashboard")
      })
    }
    else loginFail.value = true
  })
}
function CheckRegister(username, password1, password2) {
  registerFail.value = 0
  if (!username || !password1 || !password2) return
  if (password1 !== password2) {
    registerFail.value = 1
    return
  }
  Register(username, password2)
}
function Register(username, password) {
  fetch(server + 'auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams ({
      'type': 'register',
      'username': username,
      'password': password,
    })
  }).then((res) => {
    if (res.ok) {
      registerFail.value = 2
      setTimeout(() => {
        register.value = false
        registerFail.value = 0
      },1000)
    }
    else {
      registerFail.value = -1
    }
  })
}
</script>

<template>
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center">
    <div class="login-board display: flex; align-items: center; justify-content: center">
      <div v-if="!register" class="prompt">
        Sign in to your account.
        <input @keydown="loginFail = false" v-model.trim="user_name" style="margin-top: 15%" placeholder="Username" class="input"/>
        <input @keydown="loginFail = false" @keydown.enter="SignIn(user_name, password, rememberMe)" v-model="password" type="password" placeholder="Password" class="input"/>
        <div style="font-size: 0.6em">Don't have an account? <span @click="register = !register; loginFail = false" style="color: #1d90f5; cursor: pointer">Register</span>
        </div>
        <div>
          <input v-model="rememberMe" style="transform: scale(1.5) translate(-5%); margin-right: 0.5vw" type="checkbox" id="remember" name="remember"/>
          <label style="font-size: 0.5em" for="remember">Remember me.</label>
        </div>
        <div v-if="loginFail" style="font-size: 0.6em; color: orangered; margin-top: 5%">Wrong username or password.</div>
        <button @click="SignIn(user_name, password, rememberMe)" class="confirm-button">Sign in</button>
      </div>
      <div v-else class="prompt">
        Create new account.
        <input @keydown="registerFail = 0" v-model.trim="user_name_reg" style="margin-top: 15%" placeholder="Username" class="input"/>
        <input @keydown="registerFail = 0" v-model="password_reg_1" type="password" placeholder="Enter password" class="input"/>
        <input @keydown="registerFail = 0" @keydown.enter="CheckRegister(user_name_reg, password_reg_1, password_reg_2)" v-model="password_reg_2" type="password" placeholder="Re-enter password" class="input"/>
        <div style="font-size: 0.6em">Already a member? <span @click="register = !register" style="color: #1d90f5; cursor: pointer">Sign in</span>
        </div>
        <div v-if="registerFail === 1" style="font-size: 0.6em; color: orangered; margin-top: 5%">Passwords do not match.</div>
        <div v-if="registerFail === -1" style="font-size: 0.6em; color: orangered; margin-top: 5%">Username taken.</div>
        <div v-if="registerFail === 2" style="font-size: 0.6em; color: forestgreen; margin-top: 5%">Registration successful.</div>
        <button @click="CheckRegister(user_name_reg, password_reg_1, password_reg_2)" class="confirm-button">Register</button>
      </div>
     </div>
  </div>
</template>

<style scoped>
@font-face {
  font-family: gilroy-bold;
  src:url("@/assets/fonts/Gilroy-Bold.ttf");
}
@font-face {
  font-family: gilroy-medium;
  src:url("@/assets/fonts/Gilroy-Medium.ttf");
}
.confirm-button {
  width: 40%;
  aspect-ratio: 3/1;
  border-radius: 20px;
  background-color: #555b69;
  border: none;
  color: white;
  font-family: gilroy-bold, sans-serif;
  font-size: 0.65em;
  margin-top: 7%;
}
.confirm-button:hover {
  background-color: #1d90f5;
}
.login-board {
  width: 60%;
  aspect-ratio: 16/9;
  background-image: linear-gradient(to left, transparent, #272a37 75%), url("@/assets/images/log_background.jpg");
  background-size: 100%;
  background-position: center;
  margin: auto;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.2) 0 12px 28px 0, rgba(0, 0, 0, 0.1) 0 2px 4px 0, rgba(255, 255, 255, 0.05) 0 0 0 1px inset;
}
.prompt {
  height: 100%;
  aspect-ratio: 1/1.6;
  color: white;
  font-family: gilroy-bold, sans-serif;
  font-size: 3.5vh;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin-left: 5%;
}
.input {
  width: 100%;
  aspect-ratio: 6/1;
  background-color: #323644;
  color: white;
  box-sizing: border-box;
  border-radius: 17px;
  border-style: none;
  font-size: 0.7em;
  font-family: gilroy-medium, sans-serif;
  margin-bottom: 10%;
  padding: 5%;
}
.input:focus {
  outline: 1px solid #1d90f5;
  background-color: #3d404b;
}
</style>