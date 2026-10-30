<script>
  import { setContext } from "svelte";

  let { children } = $props();

  let dialogElement = $state(null);

  setContext("AlertDialog", {
    get dialogElement() {
      return dialogElement;
    },
    set dialogElement(el) {
      dialogElement = el;
    },
    open() {
      dialogElement?.showModal();
    },
    close() {
      dialogElement?.close();
    },
  });
</script>

{@render children?.()}
