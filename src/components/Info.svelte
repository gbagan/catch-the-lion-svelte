<script lang="ts">
  import type { Adversary, Message } from "../model";
  import { delay } from "../util";
  import { tutorial } from "../tutorial";
  import Emph from "./Emph.svelte";
  import { onDestroy, onMount } from "svelte";
  import { fade } from "svelte/transition";

  type Props = {
    outcome: null | 0 | 1 | 2,
    adversary: Adversary,
    isThinking: boolean,
    tutorialStep: number | null,
    tutorialNext: () => void,
    tutorialPred: () => void,
  };

  let { outcome, adversary, isThinking, tutorialStep, tutorialNext, tutorialPred }: Props = $props();

  let periodicMessage: Message | null = $state(null);

  const emph = (x: string) => ["B", x] as ["B", string]; 

  const messages: [Message, number][] = [
    [["Bienvenue sur l'appli ", emph("Catch the lion"), "."], 3000],
    [ [emph("Catch the lion"), " connu en japonais sous le nom ", emph("Dobutsu Shogi"),
      " est une variante pour enfants du Shogi."], 5000
    ],
    [ ["Le jeu a été entièrement résolu par ordinateur. Il existe ",
      emph("1 567 925 964"), " configurations possibles."], 5000
    ],
    [ ["Si les deux joueurs jouent de manière optimale, la victoire est assurée pour le ",
      emph("second"), " joueur."],
      5000
    ],
    [["Pour apprendre les règles, tu peux clicker sur ", emph("Tutoriel"), "."], 3000]
  ];

  let stop = false;

  onMount(async () => {
    let i = 0;
    while (true) {
      if (stop) {
        break;
      }
      const [message, d] = messages[i];
      periodicMessage = message;
      await delay(d);
      periodicMessage = null;
      i = (i + 1) % messages.length
      await delay(1500);
    }
  });

  onDestroy(() => stop = true);

  let message: Message | null = $derived(
    tutorialStep !== null
    ? tutorial[tutorialStep].text
    : outcome === null
    ? periodicMessage
    : outcome === 2
    ? ["Oh, cette configuration de pièces a été répétée 3 fois. C'est un ", emph("match nul"), "."]
    : adversary === 'human'
    ? [`Bravo! Le joueur ${outcome + 1} a gagné!`]
    : outcome === 0
    ? ["Zut! J'ai perdu! Tu peux changer de difficulté en cliquant sur ", emph("Nouvelle partie"), "."]
    : ["Oh oui! J'ai gagné! Tu peux changer de difficulté en cliquant sur ", emph("Nouvelle partie"), "."]
  );

  let girlExpression = $derived(
    isThinking
    ? "bg-thinking"
    : outcome === 2
    ? "bg-surprised"
    : outcome !== null && outcome === 0 && adversary !== 'human'
    ? "bg-crying"
    : outcome !== null && (outcome === 1 || adversary === 'human')
    ? "bg-happy"
    : "bg-speaking"
  );
</script>

<div class="z-20 relative w-[15rem] h-[25rem] bg-contain bg-no-repeat {girlExpression}">
  {#if message}
    <div class="tooltip -right-5" transition:fade={{duration: 500}}>
      {#each message as m}
        {#if typeof m === "string"}
          {m}
        {:else if m[0] === "R"}
          <Emph color="red">{m[1]}</Emph>
        {:else if m[0] === "G"}
          <Emph color="green">{m[1]}</Emph>
        {:else}
          <Emph color="blue">{m[1]}</Emph>
        {/if}
      {/each}
    </div>
  {/if}
  {#if tutorialStep !== null}
    <div class="absolute -right-2 flex gap-32">
      <button class="tutorial-button" onclick={tutorialPred}>Précédent</button>
      <button class="tutorial-button" onclick={tutorialNext}>Suivant</button>
    </div>
  {/if}
</div>