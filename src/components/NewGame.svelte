<script lang="ts">
  import type { Adversary, Config } from "../model";
  import Dialog from "./Dialog.svelte";

  type Props = {
    config: Config
    closeDialog: () => void
    newGame: (config: Config) => void
  }
  let { config, closeDialog, newGame }: Props = $props();

  const adversaries = [["human", "Humain"], ["level1", "Débutant"], ["level2", "Moyen"], ["level3", "Difficile"]];

  let config2 = $derived(config);

  const setAdversary = (name: string) => {
    config2 = { ...config2, adversary: name as Adversary };
  }

  const setMachineStarts = (b: boolean) => {
    config2 = { ...config2, machineStarts: b };
  }
</script>

<Dialog
  title="Nouvelle Partie"
  onCancel={closeDialog}
  onOk={() => newGame(config2)}
>
  <div class="container">
    <div class="title">Adversaire</div>
    <div class="buttons">
      {#each adversaries as [name, fullname]}
        <button
          class={{toggled: name === config2.adversary}}
          onclick={() => setAdversary(name)}
        > 
          {fullname}
        </button>
      {/each}
    </div>
    <div class="title">Qui commence</div>
    <div class="buttons">
      {#each [false, true] as b}
        <button
          class={{toggled: b === config2.machineStarts}}
          onclick={() => setMachineStarts(b)}
        >
          {b ? "Machine" : "Humain"}
        </button>
      {/each}
    </div>
  </div>  
</Dialog>

<style>
  button {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;

    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 500;

    color: rgb(55, 65, 81);
    background-color: transparent;

    border: 1px solid rgb(31, 41, 55);
    &.toggled {
      background-color: rgba(253, 224, 71, 0.5);
    }
  }

  .container {
    display: grid;
    grid-template-columns: 25% 75%;
    gap: 2rem;
  }

  .title {
    font-weight: bold;
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  .buttons {
    display: flex;
    gap: 1rem;
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
</style>