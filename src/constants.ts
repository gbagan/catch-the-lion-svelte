import type { PieceType } from "./model";

export const BOARD_START_X = 320;
export const BOARD_START_Y = 200;
export const SQUARE_WIDTH = 330;
export const SQUARE_HEIGHT = 325;
export const TILE_SIZE = 260;

export const PIECE_COLOR: Record<PieceType, string> = {
  L: "#fbc0bf",
  G: "#d6b3d5",
  E: "#d6b3d5",
  C: "#f0f4a3",
  H: "#eef1a5",
}

export const PIECE_INDEX: Record<PieceType, number> = {
  C: 0,
  E: 1,
  G: 2,
  L: 3,
  H: 4,
}