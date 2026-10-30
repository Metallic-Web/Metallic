<script>
  import AppDialog from "#lib/components/AppDialog.svelte";
  import AppsGrid from "#lib/components/AppsGrid.svelte";
  import BrowserFrame from "#lib/components/BrowserFrame.svelte";
  import Head from "#lib/components/Head.svelte";
  import Obfuscate from "#lib/components/Obfuscate.svelte";
  import SearchBar from "#lib/components/SearchBar.svelte";
  import SettingsDropdown from "#lib/components/SettingsDropdown.svelte";
  import { initObsidian } from "#lib/obsidian.js";
  import { storage } from "#lib/storage.svelte.js";
  import { Gamepad2, LayoutGrid, Plus } from "@lucide/svelte";
  import Chemical from "chemicaljs/Chemical";
  import { scale } from "svelte/transition";

  let chemical = $state();
  let ready = $state(false);
  let transport = $state("epoxy");
  let defaultWisp =
    (location.protocol === "https:" ? "wss" : "ws") +
    "://" +
    location.host +
    "/wisp/";
  let wisp = $state(defaultWisp);

  let showApps = $state(false);
  let showSettings = $state(false);
  let searchDropdownOpen = $state(false);
  let frameOpen = $state(false);

  let browserFrame = $state();
  let appDialog = $state();

  function openUrl(targetUrl, saveToHistory = true) {
    showSettings = false;
    showApps = false;
    browserFrame?.navigate(targetUrl, saveToHistory);
  }

  $effect(() => {
    initObsidian();
  });
</script>

<Head />

<Chemical bind:this={chemical} bind:ready bind:transport bind:wisp />

<SettingsDropdown
  bind:open={showSettings}
  bind:transport
  bind:wisp
  {defaultWisp}
/>

<AppDialog bind:this={appDialog} {chemical} {ready} />

<div class="w-full h-full flex flex-col items-center justify-center">
  <div class="relative flex flex-col items-center">
    <div class="flex flex-col gap-4 items-center">
      <h1 class="font-semibold text-4xl tracking-wide mb-8 text-primary">
        Metallic
      </h1>

      <SearchBar
        {chemical}
        bind:dropdownOpen={searchDropdownOpen}
        onfocusinput={() => {
          showApps = false;
          showSettings = false;
        }}
        onsearch={(target) => openUrl(target, true)}
      />
    </div>

    {#if !searchDropdownOpen}
      <div
        class="absolute top-full inset-x-0 pt-4 z-20 flex justify-center pointer-events-none"
      >
        <div class="relative flex items-center gap-2 pointer-events-auto">
          <button
            onclick={() => openUrl("https://playobsidian.com/library", false)}
            class="h-7 px-2.5 py-0.5 text-[0.8rem] rounded-full border border-input flex items-center cursor-pointer gap-1 transition-colors hover:bg-secondary"
          >
            <Gamepad2 size="14" />
            <Obfuscate text="Games" />
          </button>

          <button
            onclick={() => (showApps = !showApps)}
            class={"h-7 px-2.5 py-0.5 text-[0.8rem] rounded-full border border-input flex items-center cursor-pointer gap-1 transition-colors hover:bg-secondary " +
              (showApps ? "bg-secondary" : "")}
          >
            <LayoutGrid
              class={"transition-colors " +
                (showApps ? "fill-current" : "fill-transparent")}
              size="14"
            />
            <span>Apps</span>
          </button>

          {#if showApps}
            <button
              type="button"
              aria-label="Add App"
              disabled={storage.apps.length >= 12}
              onclick={() => appDialog?.openAdd()}
              transition:scale={{ duration: 150, start: 0.6 }}
              class="absolute left-full ml-2 size-7 rounded-full border border-input flex items-center justify-center cursor-pointer transition-colors hover:bg-secondary disabled:opacity-50 disabled:cursor-default disabled:hover:bg-transparent outline-none"
            >
              <Plus size="14" />
            </button>
          {/if}
        </div>
      </div>
    {/if}

    {#if showApps}
      <AppsGrid
        {chemical}
        {ready}
        instantHide={searchDropdownOpen}
        onopenapp={(targetUrl) => openUrl(targetUrl, false)}
        oneditapp={(app) => appDialog?.openEdit(app)}
      />
    {/if}
  </div>
</div>

<BrowserFrame
  bind:this={browserFrame}
  bind:chemical
  bind:ready
  bind:open={frameOpen}
/>
