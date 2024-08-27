<script setup>
  const props = defineProps(['information'])
  let coordinates = props.information.PieceInfos[1] & 0b00111111
  let xCoordinate = coordinates % 8
  let yCoordinate = Math.floor(coordinates / 8)
  let styleClass = "";
  switch (props.information.PieceInfos[0]) {
    case 0b01010:
      styleClass = 'WhitePawn'
      break
    case 0b10010:
      styleClass = 'BlackPawn'
      break
    case 0b01011:
      styleClass = 'WhiteKnight'
      break
    case 0b10011:
      styleClass = 'BlackKnight'
      break
    case 0b01100:
      styleClass = 'WhiteBishop'
      break
    case 0b10100:
      styleClass = 'BlackBishop'
      break
    case 0b01101:
      styleClass = 'WhiteRook'
      break
    case 0b10101:
      styleClass = 'BlackRook'
      break
    case 0b01110:
      styleClass = 'WhiteQueen'
      break
    case 0b10110:
      styleClass = 'BlackQueen'
      break
    case 0b01001:
      styleClass = 'WhiteKing'
      break
    case 0b10001:
      styleClass = 'BlackKing'
      break
  }
</script>

<template>
  <div class="Piece"
  :class="[styleClass]"
  :style="{'left': xCoordinate * 12.5 + '%', 'top': yCoordinate * 12.5 + '%'}"/>
</template>

<style scoped>
.Piece {
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  aspect-ratio: 1/1;
  width: 12.5%;
  position: absolute;
  display: inline-block;
  margin: 0;
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