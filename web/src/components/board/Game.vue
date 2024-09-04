<script setup lang="ts">
  import Piece from "./Piece.vue";
  import {ref} from "vue";
  import {ParseFEN} from "./FEN.ts";
  import {GetMoveFlag, GetSourceSquare, GetTargetSquare, MakeMove} from "./Moves.ts";
  import {websocket} from "@/connection/websocket.ts";
  import {PieceType} from "@/components/board/ChessPiece.ts";
  const legalMoves = ref(null)
  const pendingMove = ref(0)
  const promoting = ref(false)
  websocket.onmessage = (msg) => {
    if (typeof msg.data === "string") {
      console.log("Won.")
    }
    else {
      if (sideToMove.value !== props.side) {
        let move = new Uint16Array(msg.data)[0]
        Move(move, false)
      }
      else {
        let moves = new Uint16Array(msg.data)
        if (moves.length === 0) {
          console.log("Lost.")
        }
        legalMoves.value = moves
      }
    }
  }
  let selectingPiece = ref(0)
  const props = defineProps(['side', 'pos'])
  let sideToMove = ref(0)
  const pieces: any = ref(ParseFEN(props.pos));
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
      event.preventDefault()
      event.stopPropagation()
    }
    else {
      if (pieceNumber === selectingPiece.value) {
        pieces.value.get(pieceNumber).Selected = false
        selectingPiece.value = 0
        event.preventDefault()
        event.stopPropagation()
      }
      else {
        pieces.value.get(selectingPiece.value).Selected = false
        selectingPiece.value = pieceNumber
        pieces.value.get(pieceNumber).Selected = true
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
      if (pieces.value.get(pieceKey).Piece[1] === 0 && targetSquare >= 56) {
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
      ProcessMove(move_check, pieceKey)
    }
    else {
      console.log("Illegal move.")
      pieces.value.get(pieceKey).Selected = false
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
    }
    else if (flag === 5) //En passant.
      if (sideToMove.value === 0) {
        RemovePiece(targetSquare + 8)
      } else {
        RemovePiece(targetSquare - 8)
      }
    else if (flag === 2) { //King castle.
      if (sideToMove.value === 0) {
        pieces.value.get(FindPiece(63)).Piece[2] = targetSquare - 1
      } else {
        pieces.value.get(FindPiece(7)).Piece[2] = targetSquare - 1
      }
    }
    else if (flag === 3) { //Queen castle.
      if (sideToMove.value === 0) {
        pieces.value.get(FindPiece(56)).Piece[2] = targetSquare + 1
      } else {
        pieces.value.get(FindPiece(0)).Piece[2] = targetSquare - 1
      }
    }
    else if (flag === 11 || flag === 15) {
      RemovePiece(targetSquare)
      RemovePiece(targetSquare)
      if (sideToMove.value === 0) {
        ChangePiece(0, PieceType.Queen, pieceKey)
      } else {
        ChangePiece(1, PieceType.Knight, pieceKey)
      }
    }
    else if (flag === 10 || flag === 14) {
      RemovePiece(targetSquare)
      if (sideToMove.value === 0) {
        ChangePiece(0, PieceType.Rook, pieceKey)
      } else {
        ChangePiece(1, PieceType.Rook, pieceKey)
      }
    }
    else if (flag === 9 || flag === 13) {
      RemovePiece(targetSquare)
      if (sideToMove.value === 0) {
        ChangePiece(0, PieceType.Bishop, pieceKey)
      } else {
        ChangePiece(1, PieceType.Bishop, pieceKey)
      }
    }
    else if (flag === 8 || flag === 12) {
      RemovePiece(targetSquare)
      if (sideToMove.value === 0) {
        ChangePiece(0, PieceType.Knight, pieceKey)
      } else {
        ChangePiece(1, PieceType.Knight, pieceKey)
      }
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
  }
  if (props.side === 1) websocket.send("ok")
</script>

<template>
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
    <div v-if="promoting" class="modal-mask"/>
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