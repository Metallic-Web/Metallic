<script>
  import { getContext } from "svelte";
  import { twMerge } from "tailwind-merge";
  import { tv } from "tailwind-variants";

  let { class: className, children, onclose, ...restProps } = $props();

  const ctx = getContext("AlertDialog");

  const alertDialog = tv({
    base: "m-auto max-w-sm bg-input/30 backdrop-blur-md p-4 open:flex rounded-xl border border-border outline-none text-foreground flex-col gap-4 transition-all duration-200 transition-discrete opacity-0 scale-95 open:opacity-100 open:scale-100 starting:open:opacity-0 starting:open:scale-95 backdrop:transition-all backdrop:duration-200 backdrop:transition-discrete backdrop:bg-transparent backdrop:backdrop-blur-none open:backdrop:bg-black/10 open:backdrop:backdrop-blur-xs starting:open:backdrop:bg-transparent starting:open:backdrop:backdrop-blur-none pointer-events-auto",
  });

  function handleAlertClick(e) {
    if (ctx.dialogElement) {
      const rect = ctx.dialogElement.getBoundingClientRect();
      const isOutside =
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom;

      if (isOutside) {
        ctx.close();
      }
    }

    onclick?.(e);
  }
</script>

<dialog
  bind:this={ctx.dialogElement}
  class={twMerge(alertDialog(), className)}
  onclick={handleAlertClick}
  {onclose}
  {...restProps}
>
  {@render children?.()}
</dialog>
