<script setup>
import {ref, watch} from "vue";
import {Line} from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)
const hoverPlugin = {
  afterDraw: chart => {
    if (chart.tooltip?._active?.length) {
      let x = chart.tooltip._active[0].element.x;
      let yAxis = chart.scales.y;
      let ctx = chart.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, yAxis.top);
      ctx.lineTo(x, yAxis.bottom);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#0078d7';
      ctx.stroke();
      ctx.restore();
    }
  }
}
const props = defineProps(['data', 'current', 'side'])
const length = ref(0)
let data_array = []
let label_array = []
const side = ref(0)
watch(() => props.data, (newData) => {
  if (!newData[newData.length - 1][0]) {
    let winRate = (50 + 50 * (2 / (1 + Math.exp(-0.00368208 * newData[newData.length - 1][1])) - 1))
    if ((!side.value && !(newData.length % 2)) || (side.value && (newData.length % 2))) {
      winRate = 100 - winRate
    }
    data_array = [...data_array, winRate]
  }
  else
    data_array = [...data_array, data_array[data_array.length - 1]]
  label_array = [...label_array, data_array.length - 1]
  UpdatePosition(props.current)
}, {deep: true})
watch(() => props.current ,(newData) => {
  if (newData <= props.data.length - 1) {
    UpdatePosition(newData)
  }
})
watch(() => props.side, (newSide) => {
  if (newSide !== side) {
    side.value = newSide
    data_array = Array.from(data_array, (value) => 100 - value)
    data.value.datasets[0].data = data_array
    data.value.datasets[0].fill.target = side.value ? 'end' : 'origin'
    data.value.datasets[1].data = data_array
    data.value.datasets[1].fill.target = side.value ? 'origin' : 'end'
  }
})
function UpdatePosition(newPos) {
  data.value.labels = label_array.slice(0, newPos + 1)
  data.value.datasets[0].data = data_array.slice(0, newPos + 1)
  data.value.datasets[1].data = data_array.slice(0, newPos + 1)
  length.value = newPos
}
const data = ref ({
    labels: label_array,
    datasets: [
      {
        data: data_array,
        fill: {
          target: 'origin',
          above: 'white',
          below: 'white'
        },
        pointHoverBackgroundColor: '#4891cc',
      },
      {
        data: data_array,
        fill: {
          target: 'end',
          above: 'black',
          below: 'black'
        },
        backgroundColor: 'black',
        pointHoverBackgroundColor: '#4891cc',
      }
    ]
  })
const options = ref({
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: 0,
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    animation: {
      y: {
        duration: 0
      }
    },
    plugins:{
      tooltip: {
        callbacks: {
          label: (item) => {
            if (!side.value)
              return item.datasetIndex ? (100 - item.formattedValue).toFixed(2) + '%' : Number(item.formattedValue).toFixed(2) + '%'
            else return !item.datasetIndex ? (100 - item.formattedValue).toFixed(2) + '%' : Number(item.formattedValue).toFixed(2) + '%'
          },
          title: (tooltipItems) => 'Ply '+ tooltipItems[0].label
        },
        backgroundColor: "#4891cc",
        caretPadding: 20,
        size: 17,
        bodyFont: {
          size: 13,
          family: "gilroy-medium, sans-serif"
        },
        titleFont: {
          size: 13,
          family: "gilroy-medium, sans-serif"
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: "white",
          font: {
            size: 11,
            family: "gilroy-medium, sans-serif",
          },
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        ticks: {
          display: false
        }
      }
    }
})
</script>

<template>
  <Line :plugins="[hoverPlugin]" :key="length+side" :data="data" :options="options"/>
</template>

<style scoped>
</style>