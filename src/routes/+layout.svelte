<script>
  import Footer from "#lib/components/Footer.svelte";
  import Nav from "#lib/components/Nav.svelte";
  import Panic from "#lib/components/Panic.svelte";
  import { storage } from "#lib/storage.svelte";

  import "./layout.css";

  let { children } = $props();

  storage.loadStorage();
</script>

{#if storage.isLoaded}
  <Panic />
  <Nav />
  {@render children()}
  <Footer />
{/if}
