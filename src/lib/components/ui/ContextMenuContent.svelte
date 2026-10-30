<script>
  import { getContext, tick } from "svelte";

  let { children } = $props();
  const ctx = getContext("ContextMenu");
  let menuEl = $state(null);

  function preventScroll(e) {
    e.preventDefault();
  }
  function preventKeyScroll(e) {
    const scrollKeys = [" ", "PageUp", "PageDown", "Home", "End"];
    if (scrollKeys.includes(e.key)) {
      e.preventDefault();
    }
  }

  function lockScroll() {
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", preventKeyScroll, { passive: false });
  }

  function unlockScroll() {
    window.removeEventListener("wheel", preventScroll);
    window.removeEventListener("touchmove", preventScroll);
    window.removeEventListener("keydown", preventKeyScroll);
  }

  $effect(() => {
    if (ctx.isOpen) {
      lockScroll();
      tick().then(() => {
        if (menuEl) {
          const rect = menuEl.getBoundingClientRect();
          const newX =
            ctx.x + rect.width > window.innerWidth ? ctx.x - rect.width : ctx.x;
          const newY =
            ctx.y + rect.height > window.innerHeight
              ? ctx.y - rect.height
              : ctx.y;
          ctx.updatePosition(newX, newY);
          menuEl.focus();
        }
      });
    } else {
      unlockScroll();
    }
    return () => unlockScroll();
  });

  function handleOutsideInteraction(e) {
    if (
      ctx.isOpen &&
      menuEl &&
      !menuEl.contains(e.target) &&
      e.target.tagName !== "DIALOG"
    ) {
      ctx.close();
    }
  }
</script>

<svelte:window
  onclickcapture={handleOutsideInteraction}
  onclick={handleOutsideInteraction}
  oncontextmenu={handleOutsideInteraction}
  onresize={ctx.close}
  onkeydown={(e) => e.key === "Escape" && ctx.close()}
/>

<div
  role="menu"
  aria-orientation="vertical"
  aria-label="Context Menu"
  inert={!ctx.isOpen}
  bind:this={menuEl}
  class="fixed z-50 min-w-36 overflow-y-auto bg-input/30 backdrop-blur-md border border-input rounded-lg shadow-md p-1 flex flex-col
         {ctx.isOpen
    ? 'opacity-100 pointer-events-auto'
    : 'opacity-0 pointer-events-none'}"
  style="top: {ctx.y}px; left: {ctx.x}px;"
  oncontextmenu={(e) => e.preventDefault()}
  tabindex="-1"
>
  {@render children?.()}
</div>
