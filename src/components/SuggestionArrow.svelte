<script lang="ts">
  import { BOARD_START_X, BOARD_START_Y, PIECE_INDEX, SQUARE_HEIGHT, SQUARE_WIDTH } from "../constants";
  import { type Piece } from "../model";

  type Props = {
    from: number
    to: number
    pieces: Piece[]
  };

  let { from, to, pieces }: Props = $props();

  let {x1, y1, x2, y2} = $derived.by(() => {
    const piece = pieces[from];
    const x2 = BOARD_START_X + SQUARE_WIDTH / 2 + SQUARE_WIDTH * (to % 3);
    const y2 = BOARD_START_Y + SQUARE_HEIGHT / 2 + SQUARE_HEIGHT * (to / 3 | 0);
    if (piece.position === null) {
      return {
        x1: "100",
        y1: 1570 - 200 * PIECE_INDEX[piece.type],
        x2: x2,
        y2: y2
      };
    } else {
      return {
        x1: BOARD_START_X + SQUARE_WIDTH / 2 + SQUARE_WIDTH * (piece.position % 3),
        y1: BOARD_START_Y + SQUARE_HEIGHT / 2 + SQUARE_HEIGHT * (piece.position / 3 | 0),
        x2: x2,
        y2: y2
      };
    }
  })
</script>

<line
  {x1} {x2} {y1} {y2}
  stroke="red"
  stroke-width="50"
  class="arrow"
  marker-end="url(#arrowhead)"
/>

<style>
  .arrow {
    pointer-events: none;
    animation: arrow 2000ms linear infinite;
  }

  @keyframes arrow {
    0%, 100% { 
      opacity: 0.7;
    }
    50% { 
      opacity: 0;
    }
  }
</style>