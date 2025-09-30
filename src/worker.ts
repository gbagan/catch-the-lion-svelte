import { computerMove } from './ai2';

onmessage = e => {
  const {pieces, turn, adversary, played} = e.data;
  const depth = 
    adversary === 'level1' ? 2
    : adversary === 'level2' ? 5
    : adversary === 'level3' ? 8
    : 2;

  postMessage(computerMove(played, depth, turn, pieces));
}