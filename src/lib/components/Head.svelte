<script>
  import { hiddenClass } from "#lib/utils.js";
  import logo from "#lib/assets/logo.svg";
  import { storage } from "#lib/storage.svelte.js";

  let { title, icon } = $props();

  let favicon = $state();
  let pageTitle = $state();

  $effect(() => {
    pageTitle = title ? `${title} | Metallic` : "Metallic";

    favicon = icon ? icon : logo;
  });

  const activeTitle = $derived(
    storage.settings.maskTitle ? storage.settings.maskTitle : pageTitle,
  );
  const activeIcon = $derived(
    storage.settings.maskIcon ? storage.settings.maskIcon : favicon,
  );
</script>

<svelte:head>
  <title>{activeTitle}</title>
  <link crossorigin="anonymous" rel="icon" href={activeIcon} />
  {@html `<style>.${hiddenClass} {position: absolute;z-index: -10;opacity: 0;}</style>`}
</svelte:head>
