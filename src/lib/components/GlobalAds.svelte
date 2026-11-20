<script>
  import { onMount } from "svelte";

  let mounted = $state(false);

  const socialBarSrc = import.meta.env.PUBLIC_ADSTERRA_SOCIAL_BAR_SRC?.trim();
  const popunderSrc = import.meta.env.PUBLIC_ADSTERRA_POPUNDER_SRC?.trim();

  onMount(() => {
    mounted = true;
  });

  let active = $derived(mounted);
</script>

<svelte:head>
  {#if active}
    {#if socialBarSrc}
      <script data-cfasync="false" async src={socialBarSrc}></script>
    {/if}

    {#if popunderSrc}
      <script data-cfasync="false" async src={popunderSrc}></script>
    {/if}
  {/if}
</svelte:head>
