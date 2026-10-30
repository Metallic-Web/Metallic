<script module>
  const activeMenus = new Set();
</script>

<script>
  import { setContext } from "svelte";

  let { children } = $props();

  let isOpen = $state(false);
  let x = $state(0);
  let y = $state(0);
  let activeTrigger = $state(null);

  const ctx = {
    get isOpen() {
      return isOpen;
    },
    get x() {
      return x;
    },
    get y() {
      return y;
    },

    open(e) {
      e.preventDefault();
      e.stopPropagation();

      activeMenus.forEach((closeFn) => closeFn());
      activeMenus.add(ctx.close);

      if (activeTrigger) activeTrigger.removeAttribute("data-context-menu");

      activeTrigger = e.currentTarget;
      if (activeTrigger)
        activeTrigger.setAttribute("data-context-menu", "true");

      x = e.clientX;
      y = e.clientY;
      isOpen = true;
    },
    close() {
      if (!isOpen) return;
      isOpen = false;

      activeMenus.delete(ctx.close);
      if (activeTrigger) {
        activeTrigger.removeAttribute("data-context-menu");
        activeTrigger = null;
      }
    },
    updatePosition(newX, newY) {
      x = newX;
      y = newY;
    },
  };

  setContext("ContextMenu", ctx);
</script>

{@render children?.()}
