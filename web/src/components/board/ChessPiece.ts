export enum PieceType {
    King = 1,  // 0001
    Pawn = 2,  // 0010
    Knight = 3,// 0011
    Bishop = 4,// 0100
    Rook = 5,  // 0101
    Queen = 6, // 0110

    White = 8, // 1000
    Black = 16,// 10000
}

export interface ChessPiece {
    /*
    The piece's information is stored in 2 elements:
      The first element represent the information of the piece, with the 3 least significant bits denote the type, the 2 adjacent bits to the left denote the color.
      _________________________________
      | x | x | x | x | x | x | x | x |
      |___________|_______|___________|
            ↓         ↓         ↓
          Order     Color      Type
      3 most significant bits denote the order of the piece, i.e. to distinguish identical pieces from each other.
      The 6 least significant bits of the second element represent the position of the piece, the most significant bit represent castling right, and the remaining bit represent the possibility of an en passant capture.
     */
    PieceInfos: Uint8Array;
    /*
      A legal move is encoded in a 16-bit integer:
        _________________________________________________________________
        | x | x | x | x | x | x | x | x | x | x | x | x | x | x | x | x |
        |_______________________|_______________________|___|___________|
                    ↓                       ↓             ↓       ↓
             Initial square           Target square   Promotion  (1)

        If the promotion bit is 0, the 3 bits of (1) encode capturing move:
          000: No capture.
          001: Captured a pawn.
          010: Captured a knight.
          011: Captured a bishop.
          100: Captured a rook.
          101: Captured a queen.
          110: Captured a pawn en passant.
        If the promotion bit is 1, it instead encodes the type of piece the pawn is promoted to:
          000: Queen.
          001: Knight.
          010: Bishop.
          011: Rook.
     */
    LegalMoves: Uint16Array;
    //Whether the piece is currently selected by the active side.
    Selected: boolean;
}