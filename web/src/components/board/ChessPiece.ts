export enum PieceType {
    Pawn, // 0b0
    Knight, //0b001
    Bishop, //0b010
    Rook, //0b011
    Queen, //0b100
    King //0b101
}
export enum Color {
    White, Black
}
export interface ChessPiece {
    /*
    The piece's information is stored in a byte:
      _________________________________
      | x | x | x | x | x | x | x | x |
      |_______________|___|___________|
             ↓          ↓        ↓
           Order      Color    Type
      3 most significant bits denote the order of the piece, i.e. to distinguish identical pieces from each other.
   */
    Piece: Uint8Array
    //Whether the piece is currently selected by the active side.
    Selected: boolean;
}