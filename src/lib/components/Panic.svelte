<script>
  import { storage } from "#lib/storage.svelte.js";
  import { normalizeUrl } from "#lib/utils.js";

  function handleKeydown(e) {
    const tag = e.target?.tagName;
    if (
      tag !== "INPUT" &&
      tag !== "TEXTAREA" &&
      storage.settings.panicKey &&
      storage.settings.panicURL &&
      e.key === storage.settings.panicKey
    ) {
      window.location.replace(normalizeUrl(storage.settings.panicURL));
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
