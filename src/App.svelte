<script lang="ts">
  import { condition2Win, type Config, type Played, drawGame, initPieces, newConfig } from './model';
  import { delay } from './util';
  import { tutorial } from './tutorial';
  import Worker from './worker?worker';
  import Board from './components/Board.svelte';
  import Info from './components/Info.svelte';
  import NewGame from './components/NewGame.svelte';
  import Rules from './components/Rules.svelte';
  import Credits from './components/Credits.svelte';

  let pieces =  $state(initPieces());
  let turn: 0 | 1 = $state(0);
  let outcome: 0 | 1 | 2 | null = $state(null);
  let played: Played = $state([]);
  let config = $state(newConfig());
  let isThinking = $state(false);
  let dialog: "newgame" | "rules" | "credits" | null = $state(null);
  let tutorialStep: number | null = $state(null);

  let dialogEl: HTMLDialogElement = $state()!;
  let moveAudio: HTMLAudioElement = $state()!;
  let captureAudio: HTMLAudioElement = $state()!;

  const requiredMove = $derived.by(() => {
    if (tutorialStep === null) {
      return null
    }
    const action = tutorial[tutorialStep].action;
    return action.type === "playerAction" ? [action.from, action.to] as [number, number] : null
  });

  const worker = new Worker();

  const workerTask = (data: any): Promise<[number, number]> =>
    new Promise(resolve => {
      worker.onmessage = e => resolve(e.data);
      worker.postMessage(data)
    });

  const playAux = (from: number, to: number) => {
    const { owner, type, position } = pieces[from];
    const fromPos = pieces[from].position;
    const piecesCopy = pieces.map(x => ({ ...x}));
    played.push({ pieces: piecesCopy, move: [fromPos, to] });
    const j = pieces.findIndex(x => x.position === to);
    if (j >= 0) {
      captureAudio.play();
      pieces[j].position = null;
      pieces[j].owner = owner;
      if (pieces[j].type === "H") {
        pieces[j].type = "C";
      } 
      if (pieces[j].type === 'L') {
        outcome = owner;
      }
    } else {
      moveAudio.play();
    }
    pieces[from].position = to;
    if (type === 'C' && position !== null && (owner && to > 8 || !owner && to < 3)) {
      pieces[from].type = 'H';
    }
    if (condition2Win(pieces, turn)) {
      outcome = turn;
    }
    if (drawGame(pieces, played)) { 
      outcome = 2;
    }
    turn = turn === 0 ? 1 : 0;
  }

  const machinePlays = async () => {
    const data = {
      pieces: pieces.map(x => ({ ...x })),
      turn: turn,
      adversary: config.adversary,
      played: played.map(x => x.pieces.map(y => ({ ...y })))
    };
    const [[from2, to2]] = await Promise.all([workerTask(data), delay(1500)]);
    isThinking = false;
    playAux(from2, to2);
  }

  const play = async (from: number, to: number) => {
    if (config.adversary === 'human') {
      playAux(from, to)
    } else {
      playAux(from, to)
      if (outcome === null) {
        isThinking = true;
        await machinePlays();
      }
    }
  }
      
  const undo = () => {
    if (isThinking) {
      return
    }

    if (played.length > 1 || played.length === 1 && config.adversary === 'human') {
      pieces = played.pop()!.pieces;
      turn = turn === 0 ? 1 : 0
      outcome = null
    }
    const parity = played.length % 2 === 0;

    if (config.adversary !== 'human' && parity === config.machineStarts) {
      pieces = played.pop()!.pieces;
      turn = turn === 0 ? 1 : 0
    }
  }

  const openNewGameDialog = () => {
    if (isThinking) {
      return;
    }
    dialog = "newgame";
    dialogEl.showModal();
  }

  const openRulesDialog = () => {
    dialog = "rules";
    dialogEl.showModal()
  }

  const openCreditsDialog = () => {
    dialog = "credits";
    dialogEl.showModal();
  }

  const closeDialog = () => {
    dialogEl.close();
    dialog = null;
  }

  const newGame = (config: Config) => {
    config = { ...config }
    pieces = initPieces()
    played = []
    outcome = null
    turn = config.machineStarts ? 1 : 0
    isThinking = config.machineStarts
    dialog = null
    tutorialStep = null
    dialogEl.close()
    if (config.machineStarts && config.adversary !== "human") {
      machinePlays()
    }
  }

  const startTutorial = () => {
    if (isThinking) {
      return
    }
    pieces = initPieces();
    played = [];
    outcome = null;
    turn = 0;
    isThinking = false;
    dialog = null;
    tutorialStep = 0;
  }

  const tutorialPred = () => {
   if (tutorialStep === null) {
      return
    }
    tutorialStep = Math.max(0, tutorialStep - 1);
    if (tutorial[tutorialStep!].action.type !== 'read') {
      pieces = played.pop()!.pieces;
      turn = turn === 1 ? 0 : 1;
    }
  }

  const tutorialNext = () => {
    if (tutorialStep === null) {
      return
    }
    const action = tutorial[tutorialStep].action;
    if (action.type === 'playerAction') {
      return
    }
    if (action.type === 'machineAction') {
      playAux(action.from, action.to);
    }
    tutorialStep = Math.min(tutorial.length - 1, tutorialStep + 1);
  }


  const tutorialPlay = (from: number, to: number) => {
    if (tutorialStep === null) {
      return
    }
    const required = tutorial[tutorialStep].action;
    if (required.type !== 'playerAction' || from !== required.from || to !== required.to) {
      return
    }
    playAux(from, to);
    tutorialStep = Math.min(tutorial.length - 1, tutorialStep + 1);
  }
</script>

<audio src="./move.webm" preload="auto" bind:this={moveAudio}></audio>
<audio src="./capture.webm" preload="auto" bind:this={captureAudio}></audio>
<div class="relative w-screen min-h-screen bg-main bg-cover bg-no-repeat flex flew-row items-center justify-around portrait:flex-col">
  <div class="absolute bg-white w-full h-full opacity-30 z-10 pointer-events-none"></div>
  <div class="flex flex-col bg-board b-cover p-6 border-2 border-black rounded-xl gap-4 z-20">
    <div class="text-4xl">Catch the lion</div>
    <button class="btn" onclick={openNewGameDialog}>Nouvelle partie</button>
    <button class="btn" onclick={undo}>Annuler</button>
    <button class="btn" onclick={startTutorial}>Tutoriel</button>
    <button class="btn" onclick={openRulesDialog}>Règles</button>
    <button class="btn" onclick={openCreditsDialog}>Crédits</button>
  </div>
  {#if tutorialStep === null}
    <Board
      pieces={pieces}
      turn={turn}
      lastMove={played.at(-1)?.move ?? null}
      canPlay={!isThinking && outcome === null}
      requiredMove={null}
      play={play}
    />
  {:else}
    <Board
      pieces={pieces}
      turn={turn}
      lastMove={played.at(-1)?.move ?? null}
      canPlay={tutorial[tutorialStep].action.type === 'playerAction'}
      requiredMove={requiredMove}
      play={tutorialPlay}
    />
  {/if}
  <Info
    outcome={outcome}
    isThinking={isThinking}
    adversary={config.adversary}
    tutorialStep={tutorialStep}
    tutorialNext={tutorialNext}
    tutorialPred={tutorialPred}
  />
</div>
<dialog class="dialog" bind:this={dialogEl}>
  {#if dialog === "newgame"}
    <NewGame
      config={config}
      closeDialog={closeDialog}
      newGame={newGame}
    />
  {:else if dialog === "rules"}
    <Rules closeDialog={closeDialog} />
  {:else if dialog === "credits"}
    <Credits closeDialog={closeDialog} />
  {/if}
</dialog>