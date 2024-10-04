<script setup>
import Piece from "./Piece.vue";
import {onBeforeMount, onMounted, ref, watch} from "vue";
import {GetMoveFlag, GetSourceSquare, GetTargetSquare, MakeMove} from "../../js/Moves.js";
import LegalSquare from "@/components/game/vue/board/LegalSquare.vue";
import CoordinatesY from "@/components/game/vue/board/CoordinatesY.vue";
import CoordinatesX from "@/components/game/vue/board/CoordinatesX.vue";
import Highlights from "@/components/game/vue/board/Highlights.vue";
import {ParseFEN} from "@/components/game/js/FEN.js";
let sounds
onBeforeMount(() => {
  sounds = ref([
    new Audio("/assets/sounds/move.mp3"),
    new Audio("/assets/sounds/capture.mp3"),
    new Audio("/assets/sounds/castle.mp3"),
    new Audio("/assets/sounds/promote.mp3"),
  ])
})
const pendingMove = ref(0)
const promoting = ref(false)
const props = defineProps(['side', 'pos', 'legalMoves', 'sideToMove'])
const selectingPiece = ref(0)
const movableSquare = ref([])
const lastMoves = ref([])
const pieces = ref(null)
onMounted(() => {
  pieces.value = ParseFEN(props.pos)
})
function MoveIsLegal(move) {
  if (props.side !== props.sideToMove) return move
  else {
    if (props.legalMoves !== null) {
      let sourceSquare = GetSourceSquare(move)
      let targetSquare = GetTargetSquare(move)
      for (let i = 1; i < props.legalMoves.length; i++) {
        if (sourceSquare === GetSourceSquare(props.legalMoves[i]) && targetSquare === GetTargetSquare(props.legalMoves[i])) {
          return props.legalMoves[i]
        }
      }
    }
    return -1
  }
}
function SelectingPiece(event, pieceNumber) {
  if (props.side !== props.sideToMove) return
  if (selectingPiece.value === 0) {
    selectingPiece.value = pieceNumber
    pieces.value.get(pieceNumber).Selected = true
    for (let i = 1; i < props.legalMoves.length; i++) {
      if (GetSourceSquare(props.legalMoves[i]) === pieces.value.get(pieceNumber).Piece[2]) {
        movableSquare.value.push(props.legalMoves[i])
      }
    }
    event.preventDefault()
    event.stopPropagation()
  }
  else {
    if (pieceNumber === selectingPiece.value) {
      pieces.value.get(pieceNumber).Selected = false
      selectingPiece.value = 0
      movableSquare.value.length = 0
      event.preventDefault()
      event.stopPropagation()
    }
    else {
      pieces.value.get(selectingPiece.value).Selected = false
      movableSquare.value.length = 0
      selectingPiece.value = 0
      pieces.value.get(pieceNumber).Selected = true
      for (let i = 1; i < props.legalMoves.length; i++) {
        if (GetSourceSquare(props.legalMoves[i]) === pieces.value.get(pieceNumber).Piece[2]) {
          movableSquare.value.push(props.legalMoves[i])
        }
      }
      selectingPiece.value = pieceNumber
      event.preventDefault()
      event.stopPropagation()
    }
  }
}
function ChangePiece(color, type, key) {
  pieces.value.get(key).Piece[1] = (color << 3) + type
}
function RemovePiece(targetSquare) {
  let pieceKey = FindPiece(targetSquare)
  if (pieceKey !== -1)
    pieces.value.delete(pieceKey)
}
function FindPiece(square) {
  for (let [, value] of pieces.value) {
    if ((value.Piece[2]) === square) {
      return value.Piece[0]
    }
  }
  return -1
}
function ConfirmMove(move) {
  if (MoveIsLegal(move) === -1) return -1
  let pieceKey = FindPiece(GetSourceSquare(move))
  let targetSquare = GetTargetSquare(move)
  if (props.side === 0) {
    if (pieces.value.get(pieceKey).Piece[1] === 0 && targetSquare <= 7) {
      promoting.value = true
      pendingMove.value = move
      return -1
    }
    else {
      return move
    }
  } else {
    if (pieces.value.get(pieceKey).Piece[1] === 8 && targetSquare >= 56) {
      promoting.value = true
      pendingMove.value = move
      return -1
    }
    else {
      return move
    }
  }
}
function Move(move, check) {
  let sourceSquare = GetSourceSquare(move)
  let pieceKey = -1
  if (selectingPiece.value !== 0) {
    pieceKey = selectingPiece.value
  }
  else {
    let piece = FindPiece(sourceSquare)
    if (piece === -1) {
      return 0
    }
    else pieceKey = pieces.value.get(piece).Piece[0]
  }
  pieces.value.get(pieceKey).Selected = true
  let move_check
  if (check) move_check = MoveIsLegal(move)
  else move_check = move
  if (move_check !== -1) {
    pieces.value.get(pieceKey).Selected = false
    selectingPiece.value = 0
    movableSquare.value.length = 0
    ProcessMove(move_check, pieceKey)
  }
  else {
    pieces.value.get(pieceKey).Selected = false
    selectingPiece.value = 0
    movableSquare.value.length = 0
    return 0
  }
  return move_check
}
function PlayerMove(event) {
  event.preventDefault()
  event.stopPropagation()
  if (selectingPiece.value !== 0) {
    let rec = event.target.getBoundingClientRect()
    let index = Math.floor(event.offsetX/rec.width/0.125) + Math.floor(event.offsetY/rec.height/0.125) * 8
    let start = pieces.value.get(selectingPiece.value).Piece[2]
    if (props.side === 1) index = 63 - index
    let move = ConfirmMove(MakeMove(start, index))
    if (move !== -1) {
      SendMove(move, true)
    }
    else {
      pieces.value.get(selectingPiece.value).Selected = false
    }
    selectingPiece.value = 0
    movableSquare.value.length = 0
  }
}
function SendMove(move, check) {
  let send_move = Move(move, check)
  if (send_move) {
    emit('make-move', send_move)
  }
}
watch(() => props.legalMoves, () => {
  if ((props.legalMoves.length === 1) || (props.sideToMove !== props.side)) {
    Move(props.legalMoves[0], false)
  }
}, {deep:true})
const emit = defineEmits(['change-side', 'make-move'])
function ProcessMove(move, pieceKey) {
  let targetSquare = GetTargetSquare(move)
  let flag = GetMoveFlag(move)
  if (flag === 4) { //Capture
    PieceCapture(targetSquare)
    RemovePiece(targetSquare)
    sounds.value[1].play()
  }
  else if (flag === 5) { //En passant.
    if (props.sideToMove === 0) {
      PieceCapture(targetSquare + 8)
      RemovePiece(targetSquare + 8)
    } else {
      PieceCapture(targetSquare - 8)
      RemovePiece(targetSquare - 8)
    }
    sounds.value[1].play()
  }
  else if (flag === 2) { //King castle.
    if (props.sideToMove === 0) {
      pieces.value.get(FindPiece(63)).Selected = true
      pieces.value.get(FindPiece(63)).Piece[2] = targetSquare - 1
      pieces.value.get(FindPiece(targetSquare - 1)).Selected = false
    } else {
      pieces.value.get(FindPiece(7)).Selected = true
      pieces.value.get(FindPiece(7)).Piece[2] = targetSquare - 1
      pieces.value.get(FindPiece(targetSquare - 1)).Selected = false
    }
    sounds.value[2].play()
  }
  else if (flag === 3) { //Queen castle.
    if (props.sideToMove === 0) {
      pieces.value.get(FindPiece(56)).Selected = true
      pieces.value.get(FindPiece(56)).Piece[2] = targetSquare + 1
      pieces.value.get(FindPiece(targetSquare + 1)).Selected = false
    } else {
      pieces.value.get(FindPiece(0)).Selected = true
      pieces.value.get(FindPiece(0)).Piece[2] = targetSquare + 1
      pieces.value.get(FindPiece(targetSquare + 1)).Selected = false
    }
    sounds.value[2].play()
  }
  else if (flag === 11 || flag === 15) {
    PieceCapture(targetSquare)
    RemovePiece(targetSquare)
    if (props.sideToMove === 0) {
      ChangePiece(0, 4, pieceKey)
    } else {
      ChangePiece(1, 4, pieceKey)
    }
    sounds.value[3].play()
  }
  else if (flag === 10 || flag === 14) {
    PieceCapture(targetSquare)
    RemovePiece(targetSquare)
    if (props.sideToMove === 0) {
      ChangePiece(0, 3, pieceKey)
    } else {
      ChangePiece(1, 3, pieceKey)
    }
    sounds.value[3].play()
  }
  else if (flag === 9 || flag === 13) {
    PieceCapture(targetSquare)
    RemovePiece(targetSquare)
    if (props.sideToMove === 0) {
      ChangePiece(0, 2, pieceKey)
    } else {
      ChangePiece(1, 2, pieceKey)
    }
    sounds.value[3].play()
  }
  else if (flag === 8 || flag === 12) {
    PieceCapture(targetSquare)
    RemovePiece(targetSquare)
    if (props.sideToMove === 0) {
      ChangePiece(0, 1, pieceKey)
    } else {
      ChangePiece(1, 1, pieceKey)
    }
    sounds.value[3].play()
  }
  else {
    sounds.value[0].play()
  }
  pieces.value.get(pieceKey).Piece[2] = Number(targetSquare)
  emit('change-side')
  lastMoves.value = [GetSourceSquare(move), targetSquare]
}
function QueenPromote() {
  let targetSquare = GetTargetSquare(pendingMove.value)
  if (FindPiece(targetSquare) === -1) {
    pendingMove.value = pendingMove.value + (11 << 12)
  }
  else {
    pendingMove.value = pendingMove.value + (15 << 12)
  }
  SendMove(pendingMove.value, false)
  pendingMove.value = 0
  promoting.value = false
  selectingPiece.value = 0
  movableSquare.value.length = 0

}
function RookPromote() {
  let targetSquare = GetTargetSquare(pendingMove.value)
  if (FindPiece(targetSquare) === -1) {
    pendingMove.value = pendingMove.value + (10 << 12)
  }
  else {
    pendingMove.value = pendingMove.value + (14 << 12)
  }
  SendMove(pendingMove.value, false)
  pendingMove.value = 0
  promoting.value = false
  selectingPiece.value = 0
  movableSquare.value.length = 0
}
function BishopPromote() {
  let targetSquare = GetTargetSquare(pendingMove.value)
  if (FindPiece(targetSquare) === -1) {
    pendingMove.value = pendingMove.value + (9 << 12)
  }
  else {
    pendingMove.value = pendingMove.value + (13 << 12)
  }
  SendMove(pendingMove.value, false)
  pendingMove.value = 0
  promoting.value = false
  selectingPiece.value = 0
  movableSquare.value.length = 0
}
function KnightPromote() {
  let targetSquare = GetTargetSquare(pendingMove.value)
  if (FindPiece(targetSquare) === -1) {
    pendingMove.value = pendingMove.value + (8 << 12)
  }
  else {
    pendingMove.value = pendingMove.value + (12 << 12)
  }
  SendMove(pendingMove.value, false)
  pendingMove.value = 0
  promoting.value = false
  selectingPiece.value = 0
  movableSquare.value.length = 0
}
const CapturedPieces = ref([])
function UnmakeMove(move, previousMove) {
  let sourceSquare = GetSourceSquare(move);
  let targetSquare = GetTargetSquare(move);
  let movedPiece = FindPiece(targetSquare)
  pieces.value.get(movedPiece).Selected = true
  switch (GetMoveFlag(move)) {
    case 4: case 5:
      RecoverCapturedPiece()
      break;
    case 12: case 13: case 14: case 15:
      RecoverCapturedPiece()
      pieces.value.get(movedPiece).Piece[1] = (pieces.value.get(movedPiece).Piece[1] > 8) ? 8 : 0
      break;
    case 8: case 9: case 10: case 11:
      pieces.value.get(movedPiece).Piece[1] = (pieces.value.get(movedPiece).Piece[1] > 8) ? 8 : 0
      break;
    case 2:
      let k_rook = pieces.value.get(FindPiece(targetSquare - 1))
      k_rook.Selected = true
      k_rook.Piece[2] = targetSquare + 1
      k_rook.Selected = false
      break;
    case 3:
      let q_rook = pieces.value.get(FindPiece(targetSquare + 1))
      q_rook.Selected = true
      q_rook.Piece[2] = targetSquare - 2
      q_rook.Selected = false
      break;
  }
  pieces.value.get(movedPiece).Piece[2] = sourceSquare
  pieces.value.get(movedPiece).Selected = false
  emit('change-side')
  if (previousMove) {
    lastMoves.value[0] = GetSourceSquare(previousMove)
    lastMoves.value[1] = GetTargetSquare(previousMove)
  }
  else lastMoves.value = []
}
function RecoverCapturedPiece() {
  let capturedPiece = CapturedPieces.value.pop()
  pieces.value.set(capturedPiece.Piece[0], capturedPiece)
}
function PieceCapture(square) {
  let piece = FindPiece(square)
  if (piece !== -1)
    CapturedPieces.value.push(pieces.value.get(piece))
}
defineExpose({
  UnmakeMove, pieces, FindPiece
})
</script>

<template>
    <div class="board" @click="PlayerMove">
      <CoordinatesY style="left: 0.25vh;" :side="props.side"/>
      <CoordinatesX style="bottom: 0.25vh; left: 10.5%" :side="props.side"/>
      <Highlights v-for="square in lastMoves" :side="props.side" :position="square" :key="square + side"/>
      <Piece @selecting-piece="SelectingPiece" v-for="piece in pieces" :side="props.side" :sideToMove="props.sideToMove" :information="piece[1]" :key="piece[0]"/>
      <div v-if="promoting" class="promotion-popup">
        <button v-if="props.side" @click="QueenPromote" class="promotion-button black-queen"/>
        <button v-else @click="QueenPromote" class="promotion-button white-queen"/>
        <button v-if="props.side" @click="RookPromote" class="promotion-button black-rook"/>
        <button v-else @click="RookPromote" class="promotion-button white-rook"/>
        <button v-if="props.side" @click="BishopPromote" class="promotion-button black-bishop"/>
        <button v-else @click="BishopPromote" class="promotion-button white-bishop"/>
        <button v-if="props.side" @click="KnightPromote" class="promotion-button black-knight"/>
        <button v-else @click="KnightPromote" class="promotion-button white-knight"/>
      </div>

      <div v-if="selectingPiece" class="move-mask">
        <LegalSquare v-for="move in movableSquare" :side="props.side" :move="move" :key="move"/>
      </div>

      <div v-if="promoting" class="modal-mask"/>
    </div>
</template>

<style scoped>
@import "../../styles/pieces.css";
.board {
  background-image: url("/assets/board/board.svg");
  margin: 0;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  aspect-ratio: 1/1;
  height: 100%;
  width: 100%;
  position: relative;
  z-index: 0;
  left: 0;
  top: 0;
  container-type: size;
}
.move-mask {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}
.modal-mask {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 3;
  top: 0;
}
.promotion-popup {
  z-index: 4;
  position: absolute;
  display: inline-block;
  margin: 0;
  width: 60%;
  aspect-ratio: 4/1;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid black;
  background-color: #ad8463
}
.promotion-button {
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  aspect-ratio: 1/1;
  width: 25%;
  background-color: transparent;
  border: none;
}
.promotion-button:hover {
  background-color: #52624b;
}
</style>