<script>
  import { getContext } from "svelte";

  let { children, onclick, variant = "default", ...restProps } = $props();
  const ctx = getContext("ContextMenu");

  function handleClick(e) {
    if (onclick) onclick(e);
    ctx.close();
  }
</script>

<button
  onclick={handleClick}
  class="select-none flex items-center gap-2 rounded-md text-sm px-2 py-1.5 cursor-pointer transition-colors hover:bg-input/30"
  {...restProps}
>
  {@render children?.()}
</button>
