<script lang="ts">
  import { condition2Win, type Config, drawGame, initPieces, initState } from './model';
  import { delay } from './util';
  import { tutorial } from './tutorial';
  import Worker from './worker?worker';
  import Board from './components/Board.svelte';
  import Info from './components/Info.svelte';
  import NewGame from './components/NewGame.svelte';
  import Rules from './components/Rules.svelte';
  import Credits from './components/Credits.svelte';

  let dialog: HTMLDialogElement = $state()!;
  let moveAudio: HTMLAudioElement = $state()!;
  let captureAudio: HTMLAudioElement = $state()!;

  let st = $state(initState());

  const requiredMove = $derived.by(() => {
    if (st.tutorialStep === null) {
      return null
    }
    const action = tutorial[st.tutorialStep].action;
    return action.type === "playerAction" ? [action.from, action.to] as [number, number] : null
  });

  const worker = new Worker();

  const workerTask = (data: any): Promise<[number, number]> =>
    new Promise(resolve => {
      worker.onmessage = e => resolve(e.data);
      worker.postMessage(data)
    });

  const playAux = (from: number, to: number) => {
    const { owner, type, position } = st.pieces[from];
    const fromPos = st.pieces[from].position;
    const piecesCopy = st.pieces.map(x => ({ ...x}));
    st.played.push({ pieces: piecesCopy, move: [fromPos, to] });
    const j = st.pieces.findIndex(x => x.position === to);
    if (j >= 0) {
      captureAudio.play();
      st.pieces[j].position = null;
      st.pieces[j].owner = owner;
      if (st.pieces[j].type === "H") {
        st.pieces[j].type = "C";
      } 
      if (st.pieces[j].type === 'L') {
        st.outcome = owner;
      }
    } else {
      moveAudio.play();
    }
    st.pieces[from].position = to;
    if (type === 'C' && position !== null && (owner && to > 8 || !owner && to < 3)) {
      st.pieces[from].type = 'H';
    }
    if (condition2Win(st.pieces, st.turn)) {
      st.outcome = st.turn;
    }
    if (drawGame(st.pieces, st.played)) { 
      st.outcome = 2;
    }
    st.turn = st.turn === 0 ? 1 : 0;
  }

  const machinePlays = async () => {
    const data = {
      pieces: st.pieces.map(x => ({ ...x })),
      turn: st.turn,
      adversary: st.config.adversary,
      played: st.played.map(x => x.pieces.map(y => ({ ...y })))
    };
    const [[from2, to2]] = await Promise.all([workerTask(data), delay(1500)]);
    st.isThinking = false;
    playAux(from2, to2);
  }

  const play = async (from: number, to: number) => {
    if (st.config.adversary === 'human') {
      playAux(from, to)
    } else {
      playAux(from, to)
      if (st.outcome === null) {
        st.isThinking = true;
        await machinePlays();
      }
    }
  }
      
  const undo = () => {
    if (st.isThinking) {
      return
    }

    if (st.played.length > 1 || st.played.length === 1 && st.config.adversary === 'human') {
      const pieces = st.played.pop()!.pieces;
      st.pieces = pieces
      st.turn = st.turn === 0 ? 1 : 0
      st.outcome = null
    }
    const parity = st.played.length % 2 === 0;

    if (st.config.adversary !== 'human' && parity === st.config.machineStarts) {
      const pieces = st.played.pop()!.pieces;
      st.pieces = pieces
      st.turn = st.turn === 0 ? 1 : 0
    }
  }

  const openNewGameDialog = () => {
    if (st.isThinking) {
      return;
    }
    st.dialog = "newgame";
    dialog.showModal();
  }

  const openRulesDialog = () => {
    st.dialog = "rules";
    dialog.showModal()
  }

  const openCreditsDialog = () => {
    st.dialog = "credits";
    dialog.showModal();
  }

  const closeDialog = () => {
    dialog.close();
    st.dialog = null;
  }

  const newGame = (config: Config) => {
    st.config = { ...config }
    st.pieces = initPieces()
    st.played = []
    st.outcome = null
    st.turn = st.config.machineStarts ? 1 : 0
    st.isThinking = st.config.machineStarts
    st.dialog = null
    st.tutorialStep = null
    dialog.close()
    if (st.config.machineStarts && st.config.adversary !== "human") {
      machinePlays()
    }
  }

  const startTutorial = () => {
    if (st.isThinking) {
      return
    }
    st.pieces = initPieces();
    st.played = [];
    st.outcome = null;
    st.turn = 0;
    st.isThinking = false;
    st.dialog = null;
    st.tutorialStep = 0;
  }

  const tutorialPred = () => {
   if (st.tutorialStep === null) {
      return
    }
    st.tutorialStep = Math.max(0, st.tutorialStep - 1);
    if (tutorial[st.tutorialStep!].action.type !== 'read') {
      st.pieces = st.played.pop()!.pieces;
      st.turn = st.turn === 1 ? 0 : 1;
    }
  }

  const tutorialNext = () => {
    if (st.tutorialStep === null) {
      return
    }
    const action = tutorial[st.tutorialStep].action;
    if (action.type === 'playerAction') {
      return
    }
    if (action.type === 'machineAction') {
      playAux(action.from, action.to);
    }
    st.tutorialStep = Math.min(tutorial.length - 1, st.tutorialStep + 1);
  }


  const tutorialPlay = (from: number, to: number) => {
    if (st.tutorialStep === null) {
      return
    }
    const required = tutorial[st.tutorialStep].action;
    if (required.type !== 'playerAction' || from !== required.from || to !== required.to) {
      return
    }
    playAux(from, to);
    st.tutorialStep = Math.min(tutorial.length - 1, st.tutorialStep + 1);
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
  {#if st.tutorialStep === null}
    <Board
      pieces={st.pieces}
      turn={st.turn}
      lastMove={st.played.at(-1)?.move ?? null}
      canPlay={!st.isThinking && st.outcome === null}
      requiredMove={null}
      play={play}
    />
  {:else}
    <Board
      pieces={st.pieces}
      turn={st.turn}
      lastMove={st.played.at(-1)?.move ?? null}
      canPlay={tutorial[st.tutorialStep].action.type === 'playerAction'}
      requiredMove={requiredMove}
      play={tutorialPlay}
    />
  {/if}
  <Info
    outcome={st.outcome}
    isThinking={st.isThinking}
    adversary={st.config.adversary}
    tutorialStep={st.tutorialStep}
    tutorialNext={tutorialNext}
    tutorialPred={tutorialPred}
  />
</div>
<dialog class="dialog" bind:this={dialog}>
  {#if st.dialog === "newgame"}
    <NewGame
      config={st.config}
      closeDialog={closeDialog}
      newGame={newGame}
    />
  {:else if st.dialog === "rules"}
    <Rules closeDialog={closeDialog} />
  {:else if st.dialog === "credits"}
    <Credits closeDialog={closeDialog} />
  {/if}
</dialog>