<script setup lang="ts">
  import Piece from "./Piece.vue";
  import {ref} from "vue";
  import {ParseFEN, PieceCounter, pieceCounters} from "./FEN.ts";
  import {GetMoveFlag, GetSourceSquare, GetTargetSquare, MakeMove} from "./Moves.ts";
  import {websocket} from "@/connection/websocket.ts";
  import {ChessPiece, PieceType} from "@/components/board/ChessPiece.ts";
  const legalMoves = ref(null)
  websocket.onmessage = (msg) => {
    if (typeof msg.data === "string")
      console.log("Won.")
    else {
      if (sideToMove.value !== side.side) {
        let move = new Uint16Array(msg.data)[0]
        Move(move)
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
  const side = defineProps(['side'])
  let sideToMove = ref(0)
  const pieces: any = ref(ParseFEN("8/3P4/K5b1/8/R7/5k2/8/8 w - - 0 1"));
  function MoveIsLegal(move): number {
    if (side.side !== sideToMove.value) return move
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
    if (side.side !== sideToMove.value) return
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
  function AddPiece(color, type, typeCounter, position) {

    let piece: ChessPiece = {
      Piece: new Uint8Array([(color << 3) + type + pieceCounters[typeCounter], position]),
      Selected: false,
    }
    // pieces.value.set(piece.Piece[0], piece)
    pieceCounters[typeCounter]++
  }
  function RemovePiece(targetSquare) {
    pieces.value.delete(FindPiece(targetSquare).Piece[0])
  }
  function FindPiece(square): ChessPiece | null {
    for (let [, value] of pieces.value) {
      if ((value.Piece[1]) === square) {
        return value
      }
    }
    return null
  }
  function Move(move: number): number {
    let sourceSquare = GetSourceSquare(move)
    let piece
    if (selectingPiece.value !== 0) {
      piece = selectingPiece.value
    }
    else {
      let Piece: ChessPiece | null = FindPiece(sourceSquare)
      if (Piece === null) {
          return 0
        }
      piece = Piece.Piece[0]
    }
    pieces.value.get(piece).Selected = true
    let move_check = MoveIsLegal(move)
    if (move_check !== -1) {
      pieces.value.get(piece).Selected = false
      ProcessMove(move_check, piece)
    }
    else {
      console.log("Illegal move.")
      pieces.value.get(piece).Selected = false
      return 0
    }
    return move_check
  }
  function ProcessMove(move, piece): void {
    let sourceSquare = GetSourceSquare(move)
    let targetSquare = GetTargetSquare(move)
    let flag = GetMoveFlag(move)
    console.log(flag)
    pieces.value.get(piece).Piece[1] = Number(targetSquare)
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
        FindPiece(63).Piece[1] = targetSquare - 1
      } else {
        FindPiece(7).Piece[1] = targetSquare - 1
      }
    }
    else if (flag === 3) { //Queen castle.
      if (sideToMove.value === 0) {
        FindPiece(56).Piece[1] = targetSquare + 1
      } else {
        FindPiece(0).Piece[1] = targetSquare - 1
      }
    }
    else if (flag === 11 || flag === 15) {
      RemovePiece(targetSquare)
      RemovePiece(sourceSquare)
      if (sideToMove.value === 0) {
        AddPiece(0, PieceType.Queen, PieceCounter.whiteQueen, targetSquare)
      } else {
        AddPiece(1, PieceType.Queen, PieceCounter.blackQueen, targetSquare)
      }
    }
    else if (flag === 10 || flag === 14) {
      RemovePiece(targetSquare)
      RemovePiece(sourceSquare)
      if (sideToMove.value === 0) {
        AddPiece(0, PieceType.Rook, PieceCounter.whiteRook, targetSquare)
      } else {
        AddPiece(1, PieceType.Rook, PieceCounter.blackRook, targetSquare)
      }
    }
    else if (flag === 9 || flag === 13) {
      RemovePiece(targetSquare)
      RemovePiece(sourceSquare)
      if (sideToMove.value === 0) {
        AddPiece(0, PieceType.Bishop, PieceCounter.whiteBishop, targetSquare)
      } else {
        AddPiece(1, PieceType.Bishop, PieceCounter.blackBishop, targetSquare)
      }
    }
    else if (flag === 8 || flag === 12) {
      RemovePiece(targetSquare)
      // RemovePiece(sourceSquare)
      if (sideToMove.value === 0) {
        AddPiece(0, PieceType.Knight, PieceCounter.whiteKnight, targetSquare)
      } else {
        AddPiece(1, PieceType.Knight, PieceCounter.blackKnight, targetSquare)
      }
    }
    sideToMove.value = 1 - sideToMove.value
  }
  function PlayerMove(event: any) {
    event.preventDefault()
    event.stopPropagation()
    if (selectingPiece.value !== 0) {
      let rec = event.target.getBoundingClientRect()
      let index = Math.floor(event.offsetX/rec.width/0.125) + Math.floor(event.offsetY/rec.height/0.125) * 8
      if (side.side === 1) index = 63 - index
      let move = MakeMove(pieces.value.get(selectingPiece.value).Piece[1], index)
      let send_move = Move(move)
      if (send_move) {
        websocket.send(send_move)
      }
      selectingPiece.value = 0
    }
  }
</script>

<template>
  <div class="board" @click="PlayerMove">
    <Piece @selecting-piece="SelectingPiece" v-for="piece in pieces" :side="side.side" :sideToMove="sideToMove" :information="piece[1]" :key="piece[0]"/>
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
}
</style>