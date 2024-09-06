<script setup lang="ts">
  import Piece from "./Piece.vue";
  import {ref} from "vue";
  import {ParseFEN} from "./FEN.ts";
  import {GetMoveFlag, GetSourceSquare, GetTargetSquare, MakeMove} from "./Moves.ts";
  import {websocket} from "@/connection/websocket.ts";
  import {PieceType} from "@/components/board/ChessPiece.ts";
  import LegalSquare from "@/components/board/LegalSquare.vue";
  import {useRouter} from "vue-router";
  import CoordinatesY from "@/components/board/CoordinatesY.vue";
  import CoordinatesX from "@/components/board/CoordinatesX.vue";
  const moveSound = new Audio("/sounds/move.mp3")
  const captureSound = new Audio("/sounds/capture.mp3")
  const castlingSound = new Audio("/sounds/castle.mp3")
  const promoteSound = new Audio("/sounds/promote.mp3")
  const winningSound = new Audio("/sounds/win.mp3")
  const losingSound = new Audio("/sounds/lose.mp3")
  const drawingSound = new Audio("/sounds/draw.mp3")
  const legalMoves = ref(null)
  const pendingMove = ref(0)
  const promoting = ref(false)
  const props = defineProps(['side', 'pos'])
  let gameState = ParseFEN(props.pos)
  const pieces: any = ref(gameState[0]);
  const sideToMove = ref(gameState[1])
  const selectingPiece = ref(0)
  const movableSquare = ref([])
  const result = ref(null)
  const connectionLost = ref(null)
  if (props.side === 0) {
    websocket.onmessage = (msg) => {
    legalMoves.value = new Uint16Array(msg.data)
    websocket.onmessage = (msg) => {
      if (typeof msg.data === "string") {
        if (msg.data === "The other player has lost connection.") {
          connectionLost.value = msg.data
          return
        }
        websocket.onclose = () => {}
        result.value = msg.data.toString()
        if (props.side === sideToMove.value) sideToMove.value = 1 - sideToMove.value
        if (msg.data.toString() === "You won.") {
          winningSound.play()
        }
        else if (msg.data.toString() === "You lost.") {
          losingSound.play()
        }
        else {
          drawingSound.play()
        }
      }
      else {
        if (sideToMove.value !== props.side) {
          let moves = new Uint16Array(msg.data)
          let move = moves[0]
          Move(move, false)
          legalMoves.value = moves.slice(1)
        }
      }
    }
  }
  }
  else {
    websocket.onmessage = (msg) => {
      if (typeof msg.data === "string") {
        if (msg.data === "The other player has lost connection.") {
          connectionLost.value = msg.data
          return
        }
        websocket.onclose = () => {}
        result.value = msg.data.toString()
        if (props.side === sideToMove.value) sideToMove.value = 1 - sideToMove.value
        if (msg.data.toString() === "You won.") {
          winningSound.play()
        }
        else if (msg.data.toString() === "You lost.") {
          losingSound.play()
        }
        else {
          drawingSound.play()
        }
      }
      else {
        if (sideToMove.value !== props.side) {
          let moves = new Uint16Array(msg.data)
          let move = moves[0]
          Move(move, false)
          legalMoves.value = moves.slice(1)
        }
      }
    }
  }
  websocket.onclose = () => {
    connectionLost.value = "Connection lost."
  }
  function MoveIsLegal(move): number {
    if (props.side !== sideToMove.value) return move
    else {
      if (legalMoves.value !== null) {
        let sourceSquare = GetSourceSquare(move)
        let targetSquare = GetTargetSquare(move)
        for (let i = 0; i < legalMoves.value.length; i++) {
          if (sourceSquare === GetSourceSquare(legalMoves.value[i]) && targetSquare === GetTargetSquare(legalMoves.value[i])) {
            return legalMoves.value[i]
          }
        }
      }
      return -1
    }
  }
  function SelectingPiece(event: any, pieceNumber: number) {
    if (props.side !== sideToMove.value) return
    if (selectingPiece.value === 0) {
      selectingPiece.value = pieceNumber
      pieces.value.get(pieceNumber).Selected = true
      for (let i = 0; i < legalMoves.value.length; i++) {
        if (GetSourceSquare(legalMoves.value[i]) === pieces.value.get(pieceNumber).Piece[2]) {
          movableSquare.value.push(legalMoves.value[i])
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
        for (let i = 0; i < legalMoves.value.length; i++) {
          if (GetSourceSquare(legalMoves.value[i]) === pieces.value.get(pieceNumber).Piece[2]) {
            movableSquare.value.push(legalMoves.value[i])
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
  function FindPiece(square): number {
    for (let [, value] of pieces.value) {
      if ((value.Piece[2]) === square) {
        return value.Piece[0]
      }
    }
    return -1
  }
  function ConfirmMove(move: number): number {
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
  function Move(move: number, check): number {
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
  function PlayerMove(event: any) {
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
      selectingPiece.value = 0
      movableSquare.value.length = 0
    }
  }
  function SendMove(move, check) {
    let send_move = Move(move, check)
    if (send_move) {
      websocket.send(send_move)
    }
  }
  function ProcessMove(move, pieceKey): void {
    let targetSquare = GetTargetSquare(move)
    let flag = GetMoveFlag(move)
    if (flag === 4) { //Capture
      RemovePiece(targetSquare)
      captureSound.play()
    }
    else if (flag === 5) { //En passant.
      if (sideToMove.value === 0) {
        RemovePiece(targetSquare + 8)
      } else {
        RemovePiece(targetSquare - 8)
      }
      captureSound.play()
    }
    else if (flag === 2) { //King castle.
      if (sideToMove.value === 0) {
        pieces.value.get(FindPiece(63)).Selected = true
        pieces.value.get(FindPiece(63)).Piece[2] = targetSquare - 1
        pieces.value.get(FindPiece(targetSquare - 1)).Selected = false
      } else {
        pieces.value.get(FindPiece(7)).Selected = true
        pieces.value.get(FindPiece(7)).Piece[2] = targetSquare - 1
        pieces.value.get(FindPiece(targetSquare - 1)).Selected = false
      }
      castlingSound.play()
    }
    else if (flag === 3) { //Queen castle.
      if (sideToMove.value === 0) {
        pieces.value.get(FindPiece(56)).Selected = true
        pieces.value.get(FindPiece(56)).Piece[2] = targetSquare + 1
        pieces.value.get(FindPiece(targetSquare + 1)).Selected = false
      } else {
        pieces.value.get(FindPiece(0)).Selected = true
        pieces.value.get(FindPiece(0)).Piece[2] = targetSquare + 1
        pieces.value.get(FindPiece(targetSquare + 1)).Selected = false
      }
      castlingSound.play()
    }
    else if (flag === 11 || flag === 15) {
      RemovePiece(targetSquare)
      RemovePiece(targetSquare)
      if (sideToMove.value === 0) {
        ChangePiece(0, PieceType.Queen, pieceKey)
      } else {
        ChangePiece(1, PieceType.Queen, pieceKey)
      }
      promoteSound.play()
    }
    else if (flag === 10 || flag === 14) {
      RemovePiece(targetSquare)
      if (sideToMove.value === 0) {
        ChangePiece(0, PieceType.Rook, pieceKey)
      } else {
        ChangePiece(1, PieceType.Rook, pieceKey)
      }
      promoteSound.play()
    }
    else if (flag === 9 || flag === 13) {
      RemovePiece(targetSquare)
      if (sideToMove.value === 0) {
        ChangePiece(0, PieceType.Bishop, pieceKey)
      } else {
        ChangePiece(1, PieceType.Bishop, pieceKey)
      }
      promoteSound.play()
    }
    else if (flag === 8 || flag === 12) {
      RemovePiece(targetSquare)
      if (sideToMove.value === 0) {
        ChangePiece(0, PieceType.Knight, pieceKey)
      } else {
        ChangePiece(1, PieceType.Knight, pieceKey)
      }
      promoteSound.play()
    }
    else {
      moveSound.play()
    }
    pieces.value.get(pieceKey).Piece[2] = Number(targetSquare)
    sideToMove.value = 1 - sideToMove.value
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
  const router = useRouter()
  function returnToMenu() {
    pieces.value.clear()
    router.push({path : "/"})
  }
  websocket.send("ok")
</script>

<template>
  <CoordinatesY style="left: 24vw; transform: translateY(-50%);" :side="side.value"/>
  <CoordinatesY style="left: 70vw; transform: translateY(-50%);" :side="side.value"/>
  <CoordinatesX style="top: 1vh" :side="side.value"/>
  <CoordinatesX style="top: 95.5vh" :side="side.value"/>
  <div class="board" @click="PlayerMove">
    <Piece @selecting-piece="SelectingPiece" v-for="piece in pieces" :side="props.side" :sideToMove="sideToMove" :information="piece[1]" :key="piece[0]"/>
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
      <LegalSquare v-for="move in movableSquare" :side="side" :move="move" :key="move"/>
    </div>

    <div v-if="promoting || (result !== null)" class="modal-mask"/>

    <div v-if="result !== null" class="end-popup">
      <div style="font-size: 3.5vh; padding-bottom: 1vh;">The game has concluded.</div>
      <div style="font-size: 3vh; padding-bottom: 1vh;">{{result}}</div>
      <button @click="returnToMenu" class="end-button">Back to main menu</button>
    </div>

    <div v-if="connectionLost !== null" class="end-popup">
      <div style="font-size: 3.5vh; padding-bottom: 1vh;">{{connectionLost}}</div>
      <button @click="returnToMenu" class="end-button">Back to main menu.</button>
    </div>
  </div>
</template>

<style scoped>
.board {
  background-image: url("@/assets/board/board.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  aspect-ratio: 1/1;
  height: 90vh;
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.end-button {
  background-color: #81b64c;
  border: none;
  padding: 1vh;
  font-family: "Open Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
  font-variation-settings: "wdth" 100;
  font-size: 2vh;
  border-radius: 5px;
}
.end-button:hover {
  background-color: #a3d160;
}
.end-popup {
  background-color: #79796a;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 4;
  width: 30vw;
  height: 18vh;
  border-radius: 10px;
  padding: 15px;
  box-sizing: border-box;
  border: 1px solid black;
  font-family: "Open Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
  font-variation-settings: "wdth" 100;
  animation: zoom-in 0.2s;
}
@keyframes zoom-in {
  from {
    transform: scale(0.9, 0.9) translate(-55.6%, -55.6%);
  }
  to {
    transform: scale(1, 1) translate(-50%, -50%);
  }
}
.move-mask {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}
.modal-mask {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 3;
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
.white-queen {
  background-image: url("@/assets/board/white_queen.svg");
}
.white-rook {
  background-image: url("@/assets/board/white_rook.svg");
}
.white-bishop {
  background-image: url("@/assets/board/white_bishop.svg");
}
.white-knight {
  background-image: url("@/assets/board/white_knight.svg");
}
.black-queen {
  background-image: url("@/assets/board/black_queen.svg");
}
.black-rook {
  background-image: url("@/assets/board/black_rook.svg");
}
.black-bishop {
  background-image: url("@/assets/board/black_bishop.svg");
}
.black-knight {
  background-image: url("@/assets/board/black_knight.svg");
}
</style>