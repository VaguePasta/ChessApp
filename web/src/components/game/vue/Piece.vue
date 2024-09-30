<script setup lang="ts">
  import {ref, watch} from "vue";
  const props = defineProps(['side','information','sideToMove'])
  const oldType = ref(props.information.Piece[1])
  const oldPos = ref(props.information.Piece[2])
  const oldLeft = ref(props.side === 0 ? (props.information.Piece[2] % 8) * 12.5 + '%' : 87.5 - (props.information.Piece[2] % 8) * 12.5 + '%')
  const oldTop = ref(props.side === 0 ? Math.floor(props.information.Piece[2] / 8) * 12.5 + '%' : 87.5 - Math.floor(props.information.Piece[2] / 8) * 12.5 + '%')
  let styleClass = "";
  function SetStyle() {
    switch (props.information.Piece[1] & 0b1111) {
      case 0:
        styleClass = 'white-pawn'
        break
      case 8:
        styleClass = 'black-pawn'
        break
      case 1:
        styleClass = 'white-knight'
        break
      case 9:
        styleClass = 'black-knight'
        break
      case 2:
        styleClass = 'white-bishop'
        break
      case 10:
        styleClass = 'black-bishop'
        break
      case 3:
        styleClass = 'white-rook'
        break
      case 11:
        styleClass = 'black-rook'
        break
      case 4:
        styleClass = 'white-queen'
        break
      case 12:
        styleClass = 'black-queen'
        break
      case 5:
        styleClass = 'white-king'
        break
      case 13:
        styleClass = 'black-king'
        break
    }
  }
  SetStyle()
  watch(props.information, (newPosition) => {
    if (oldType !== props.information.Piece[1]) SetStyle()
    if (oldPos.value === newPosition.Piece[2]) return
    if (props.side === 0) {
      oldLeft.value = ((oldPos.value % 8) * 12.5).toString() + '%'
      oldTop.value = (Math.floor(oldPos.value / 8) * 12.5).toString() + '%'
    }
    else {
      oldLeft.value = (87.5 - ((oldPos.value) % 8) * 12.5).toString() + '%'
      oldTop.value = (87.5 - Math.floor((oldPos.value) / 8) * 12.5).toString() + '%'
    }
    oldPos.value = newPosition.Piece[2]
  })
</script>

<template>
  <div class="Piece" @click="$emit('selecting-piece', $event, props.information.Piece[0])"
       :key="oldPos"
  :class="[styleClass,
  props.information.Selected ? 'Selected' : '', ((props.side !== (props.information.Piece[1] >> 3 & 1)) || props.sideToMove !== props.side) ? 'Opponent' : '']"
  :style="[ props.side === 0 ?
      {'left': ((props.information.Piece[2]) % 8) * 12.5 + '%', 'top': Math.floor((props.information.Piece[2]) / 8) * 12.5 + '%'} :
      {'left': 87.5 - ((props.information.Piece[2]) % 8) * 12.5 + '%', 'top': 87.5 - Math.floor((props.information.Piece[2]) / 8) * 12.5 + '%'}]"/>
</template>

<style scoped>
@import "../styles/pieces.css";
@keyframes Move {
  from {
    left: v-bind(oldLeft);
    top: v-bind(oldTop);
  }
}
.Piece {
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  aspect-ratio: 1/1;
  width: 12.5%;
  position: absolute;
  margin: 0;
  animation: Move 0.2s;
  z-index: 2;
}

.Opponent {
  pointer-events: none;
}
.Selected {
  background-color: #648b5e;
}
</style>