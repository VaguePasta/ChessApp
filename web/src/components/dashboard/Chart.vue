<script setup>
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'
import {ref} from "vue";
import {User} from "@/connection/connections.js";

ChartJS.register(ArcElement, Tooltip, Legend)
const data = ref({
  labels: ['Win', 'Draw', 'Loss'],
  datasets: [
    {
      backgroundColor: ['#228B22', 'gray', 'orangered'],
      data: [User.win, User.draw, User.loss]
    }
  ]
})
const options = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'white',
      },
      position: 'bottom'
    }
  }
})
</script>

<template>
<Pie :key="User.username" :data="data" :options="options"/>
</template>

<style scoped>

</style>