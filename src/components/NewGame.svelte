<script lang="ts">
  import type { Adversary, Config } from "../model";

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

<div class="dialog-title">Nouvelle partie</div>
<div class="dialog-body grid grid-cols-[20%_80%] gap-8">
  <div class="text-bold text-lg">Adversaire</div>
  <div class="flex gap-4">
    {#each adversaries as [name, fullname]}
      <button
        class={["togglebtn", {"toggledbtn": name === config.adversary}]}
        onclick={() => setAdversary(name)}
      > 
        {fullname}
      </button>
    {/each}
  </div>
  <div class="text-bold text-lg">Qui commence</div>
  <div class="flex gap-4 text-lg">
    {#each [false, true] as b}
      <button
        class={["togglebtn", {"toggledbtn": b === config.machineStarts}]}
        onclick={() => setMachineStarts(b)}
      >
        {b ? "Machine" : "Humain"}
      </button>
    {/each}
  </div>
</div>
<div class="dialog-buttons">
  <button class="btn" onclick={closeDialog}>Annuler</button>
  <button class="btn" onclick={() => newGame(config)}>OK</button>
</div>