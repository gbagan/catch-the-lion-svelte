<script lang="ts">
  import Emph from "./Emph.svelte"
  type Props = { closeDialog: () => void }
  let {closeDialog }: Props = $props();
</script>

<div class="dialog-title">Crédits</div>
<div class="dialog-body">
  <ul>
    <li class="list-disc"><Emph>Catch the lion</Emph> est un jeu de plateau créé
      par Madoka Kitao et Maiko Fujita.</li>
    <li class="list-disc">L'éditeur du jeu est Nekomado.</li>
    <li class="list-disc">L'application a été écrite par Guillaume Bagan.</li>
    <li class="list-disc">Le code source est sous licence MIT.</li>
    <li class="list-disc">Les différentes images ont été générées par Dall-E.</li>
    <li class="list-disc">Les différents sons proviennent de la plate-forme Lichess.</li>
  </ul>
</div> 
<div class="dialog-buttons">
  <button class="btn" onclick={closeDialog}>OK</button>
</div>