<script>
  import { getContext } from "svelte";

  let { children, ...restProps } = $props();
  const ctx = getContext("ContextMenu");
</script>

<div class="contents" oncontextmenu={ctx.open} {...restProps}>
  {@render children?.()}
</div>
