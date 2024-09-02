<script setup lang="ts">
  import {ref, watch} from "vue";
  const props = defineProps(['side','information','sideToMove'])
  const oldPos = ref(props.information.Piece[1])
  const oldLeft = ref(props.side === 0 ? (((props.information.Piece[1] % 8) * 12.5).toString() + '%') : ((Math.floor(props.information.Piece[1] / 8) * 12.5).toString() + '%'))
  const oldTop = ref(props.side === 0 ? ((Math.floor(props.information.Piece[1] / 8) * 12.5).toString() + '%') : ((87.5 - (props.information.Piece[1] % 8) * 12.5).toString() + '%'))
  let styleClass = "";
  switch (props.information.Piece[0] & 0b1111) {
    case 0:
      styleClass = 'WhitePawn'
      break
    case 8:
      styleClass = 'BlackPawn'
      break
    case 1:
      styleClass = 'WhiteKnight'
      break
    case 9:
      styleClass = 'BlackKnight'
      break
    case 2:
      styleClass = 'WhiteBishop'
      break
    case 10:
      styleClass = 'BlackBishop'
      break
    case 3:
      styleClass = 'WhiteRook'
      break
    case 11:
      styleClass = 'BlackRook'
      break
    case 4:
      styleClass = 'WhiteQueen'
      break
    case 12:
      styleClass = 'BlackQueen'
      break
    case 5:
      styleClass = 'WhiteKing'
      break
    case 13:
      styleClass = 'BlackKing'
      break
  }
  watch(props.information, (newPosition) => {
    if (oldPos.value === newPosition.Piece[1]) return
    if (props.side === 0) {
      oldLeft.value = ((oldPos.value % 8) * 12.5).toString() + '%'
      oldTop.value = (Math.floor(oldPos.value / 8) * 12.5).toString() + '%'
    }
    else {
      oldLeft.value = (87.5 - ((oldPos.value) % 8) * 12.5).toString() + '%'
      oldTop.value = (87.5 - Math.floor((oldPos.value) / 8) * 12.5).toString() + '%'
    }
    oldPos.value = newPosition.Piece[1]
  })
</script>

<template>
  <div class="Piece" @click="$emit('selecting-piece', $event, props.information.Piece[0])"
       :key="oldPos"
  :class="[styleClass,
   props.information.Selected ? 'Selected' : '', ((props.side !== (props.information.Piece[0] >> 3 & 1)) || props.sideToMove !== props.side) ? 'Opponent' : '']"
  :style="[ props.side === 0 ?
      {'left': ((props.information.Piece[1]) % 8) * 12.5 + '%', 'top': Math.floor((props.information.Piece[1]) / 8) * 12.5 + '%'} :
      {'left': 87.5 - ((props.information.Piece[1]) % 8) * 12.5 + '%', 'top': 87.5 - Math.floor((props.information.Piece[1]) / 8) * 12.5 + '%'}]"/>
</template>

<style scoped>
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
  display: inline-block;
  margin: 0;
  animation: Move 0.2s;
}

.Opponent {
  pointer-events: none;
}
.Selected {
  background-color: #648b5e;
}
.BlackPawn {
  background-image: url("@/assets/board/black_pawn.svg");
}
.WhitePawn {
  background-image: url("@/assets/board/white_pawn.svg");
}
.BlackKnight {
  background-image: url("@/assets/board/black_knight.svg");
}
.WhiteKnight {
  background-image: url("@/assets/board/white_knight.svg");
}
.BlackBishop {
  background-image: url("@/assets/board/black_bishop.svg");
}
.WhiteBishop {
  background-image: url("@/assets/board/white_bishop.svg");
}
.BlackRook {
  background-image: url("@/assets/board/black_rook.svg");
}
.WhiteRook {
  background-image: url("@/assets/board/white_rook.svg");
}
.BlackQueen {
  background-image: url("@/assets/board/black_queen.svg");
}
.WhiteQueen {
  background-image: url("@/assets/board/white_queen.svg");
}
.BlackKing {
  background-image: url("@/assets/board/black_king.svg");
}
.WhiteKing {
  background-image: url("@/assets/board/white_king.svg");
}
</style>