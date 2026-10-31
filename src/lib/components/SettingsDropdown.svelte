<script>
  import masks from "#lib/assets/masks.js";
  import searchPresets from "#lib/assets/searchPresets.js";
  import themes from "#lib/assets/themes.js";
  import { storage } from "#lib/storage.svelte.js";
  import { clearSiteData, normalizeUrl } from "#lib/utils.js";
  import {
    Ban,
    Check,
    ChevronDown,
    Globe,
    Search,
    Settings,
    ShieldCheck,
  } from "@lucide/svelte";
  import { fade, fly, slide } from "svelte/transition";
  import Switch from "./ui/Switch.svelte";

  let {
    open = $bindable(false),
    transport = $bindable(""),
    wisp = $bindable(""),
  } = $props();

  let buttonEl = $state();
  let dropdownEl = $state();
  let openSection = $state(null);
  let recordingKey = $state(false);
  let clearedHistory = $state(false);
  let clearedSiteData = $state(false);
  let timeoutId = null;
  let defaultWisp = import.meta.env.VITE_WISP_URL
    ? import.meta.env.VITE_WISP_URL.replace("{host}", location.hostname)
    : `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/wisp/`;

  const activePreset = $derived(
    searchPresets.find((e) => e.url === storage.settings.searchEngine),
  );

  function toggleSection(sec) {
    openSection = openSection === sec ? null : sec;
  }

  function setMask(title, icon) {
    storage.updateSetting("maskTitle", title);
    storage.updateSetting("maskIcon", icon);
  }

  function handlePointerDown(e) {
    if (
      open &&
      buttonEl &&
      !buttonEl.contains(e.target) &&
      !dropdownEl?.contains(e.target)
    ) {
      open = false;
      recordingKey = false;
    }
  }

  function handleKeydown(e) {
    if (recordingKey) {
      e.preventDefault();
      e.stopPropagation();
      const key = e.key === "Escape" || e.key === "Backspace" ? "" : e.key;
      storage.updateSetting("panicKey", key);
      recordingKey = false;
      return;
    }

    const tag = e.target?.tagName;
    if (
      tag !== "INPUT" &&
      tag !== "TEXTAREA" &&
      storage.settings.panicKey &&
      storage.settings.panicURL &&
      e.key === storage.settings.panicKey
    ) {
      window.location.replace(normalizeUrl(storage.settings.panicURL));
    }
  }
  function aboutBlankCloak() {
    const currentURL = window.location.href;
    const win = window.open("about:blank", "_blank");

    if (win) {
      win.document.write(
        `<body style="margin:0"><iframe src="${currentURL}" style="width:100vw;height:100vh;border:none;display:block"></iframe></body>`,
      );
      win.document.close();
    }

    window.location.replace("about:blank");
  }

  function historyToggle(checked) {
    storage.updateSetting("history", checked);

    if (!checked) {
      storage.updateHistory([]);
    }
  }

  function handleResetHistory() {
    storage.updateHistory([]);
    clearedHistory = true;

    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      clearedHistory = false;
    }, 2000);
  }

  function handleClearSiteData() {
    clearSiteData();
    clearedSiteData = true;

    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      clearedSiteData = false;
    }, 2000);
  }
</script>

<svelte:window onpointerdown={handlePointerDown} onkeydown={handleKeydown} />

<div
  class="fixed top-4 right-4 z-20 flex flex-col items-end pointer-events-none"
>
  <button
    bind:this={buttonEl}
    onclick={() => (open = !open)}
    class={"pointer-events-auto h-9 px-2.5 text-sm rounded-full border border-input flex items-center cursor-pointer gap-1.5 transition-colors hover:bg-secondary " +
      (open ? "bg-secondary" : "")}
  >
    <Settings
      class={"transition-transform duration-300 " + (open ? "rotate-90" : "")}
      size="16"
    />
    <span>Settings</span>
  </button>

  {#if open}
    <div
      bind:this={dropdownEl}
      in:fly={{ y: -10, duration: 200 }}
      out:fade={{ duration: 150 }}
      class="pointer-events-auto mt-2 w-80 max-h-[calc(100dvh-4.5rem)] overflow-y-auto flex flex-col gap-4 bg-input/30 rounded-xl p-4 text-sm border border-border backdrop-blur-md"
    >
      <div class="flex flex-col gap-2 shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span>Theme</span>
            <span class="text-xs text-muted">Metallic appearance</span>
          </div>
          <span class="text-xs">{storage.theme}</span>
        </div>
        <div class="grid grid-cols-4 gap-1.5">
          {#each themes as theme}
            <button
              onclick={() => storage.updateTheme(theme.name)}
              data-active={storage.theme === theme.name}
              title={theme.name}
              class="h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors border border-input hover:bg-input/30 data-[active=true]:bg-input/30"
            >
              <span
                class="size-4 rounded-full border border-input"
                style="background-color: {theme.color}"
              ></span>
            </button>
          {/each}
        </div>
      </div>

      <div class="flex flex-col shrink-0">
        <div class="flex flex-col mb-2">
          <span>Tab Mask</span>
          <span class="text-xs text-muted">Disguise tab title and favicon</span>
        </div>
        <button
          onclick={() => toggleSection("cloak")}
          class="w-full h-8 shrink-0 px-3 rounded-lg bg-input/30 border border-input flex items-center justify-between cursor-pointer"
        >
          <div class="flex items-center gap-2.5 overflow-hidden">
            {#if storage.settings.maskIcon}
              {#key storage.settings.maskIcon}
                <img
                  src={storage.settings.maskIcon}
                  alt="Cloak Icon"
                  class="size-4 rounded-sm object-contain shrink-0"
                  onerror={(e) => {
                    e.currentTarget.classList.add("hidden");
                    e.currentTarget.nextElementSibling.classList.remove(
                      "hidden",
                    );
                  }}
                />
                <div class="hidden">
                  <Globe size="16" class="text-muted shrink-0" />
                </div>
              {/key}
            {:else if storage.settings.maskTitle}
              <Globe size="16" class="text-muted shrink-0" />
            {:else}
              <Ban size="16" class="text-muted shrink-0" />
            {/if}
            <span class="truncate">{storage.settings.maskTitle || "None"}</span>
          </div>
          <ChevronDown
            size="16"
            class={"text-muted shrink-0 transition-transform duration-200 " +
              (openSection === "cloak" ? "rotate-180" : "")}
          />
        </button>
        {#if openSection === "cloak"}
          <div
            transition:slide={{ duration: 200 }}
            class="overflow-hidden shrink-0"
          >
            <div class="flex flex-col gap-2 pt-2">
              <div class="grid grid-cols-4 gap-1.5">
                <button
                  onclick={() => setMask("", "")}
                  data-active={!storage.settings.maskTitle &&
                    !storage.settings.maskIcon}
                  title="No Mask"
                  class="h-8 rounded-lg border border-input flex items-center justify-center cursor-pointer transition-colors hover:bg-secondary data-[active=true]:bg-input/30"
                >
                  <Ban size="16" class="text-muted" />
                </button>
                {#each masks as mask}
                  <button
                    onclick={() => setMask(mask.title, mask.icon)}
                    data-active={storage.settings.maskTitle === mask.title &&
                      storage.settings.maskIcon === mask.icon}
                    title={mask.title}
                    class="h-8 rounded-lg border border-input flex items-center justify-center cursor-pointer transition-colors hover:bg-secondary data-[active=true]:bg-secondary"
                  >
                    <img
                      src={mask.icon}
                      alt={mask.title}
                      class="size-4 rounded-sm object-contain"
                    />
                  </button>
                {/each}
              </div>
              <div class="flex gap-1.5">
                <input
                  type="text"
                  value={storage.settings.maskTitle}
                  oninput={(e) =>
                    storage.updateSetting("maskTitle", e.target.value)}
                  placeholder="Title"
                  class="w-1/2 h-8 px-2.5 rounded-lg bg-input/30 border border-input outline-none placeholder:text-muted"
                />
                <input
                  type="text"
                  value={storage.settings.maskIcon}
                  oninput={(e) =>
                    storage.updateSetting("maskIcon", e.target.value)}
                  placeholder="Icon URL"
                  class="w-1/2 h-8 px-2.5 rounded-lg bg-input/30 border border-input outline-none placeholder:text-muted"
                />
              </div>
            </div>
          </div>
        {/if}
      </div>

      <div class="flex flex-col shrink-0">
        <div class="flex flex-col mb-2">
          <span>Search Engine</span>
          <span class="text-xs text-muted">Default search provider</span>
        </div>
        <button
          onclick={() => toggleSection("search")}
          class="w-full h-8 shrink-0 px-2.5 rounded-lg bg-input/30 border border-input flex items-center justify-between cursor-pointer"
        >
          <div class="flex items-center gap-2.5">
            {#if activePreset}
              <img
                src={activePreset.icon}
                alt={activePreset.name}
                class="size-4 rounded-sm object-contain"
              />
            {:else}
              <Search size="16" class="text-muted" />
            {/if}
            <span>
              {activePreset
                ? activePreset.name
                : storage.settings.searchEngine
                  ? "Custom"
                  : "None"}
            </span>
          </div>
          <ChevronDown
            size="16"
            class={"text-muted transition-transform duration-200 " +
              (openSection === "search" ? "rotate-180" : "")}
          />
        </button>
        {#if openSection === "search"}
          <div
            transition:slide={{ duration: 200 }}
            class="overflow-hidden shrink-0"
          >
            <div class="flex flex-col gap-2 pt-2">
              <div class="grid grid-cols-5 gap-1.5">
                {#each searchPresets as engine}
                  <button
                    onclick={() =>
                      storage.updateSetting("searchEngine", engine.url)}
                    title={engine.name}
                    data-active={storage.settings.searchEngine === engine.url}
                    class="h-8 rounded-lg border border-input flex items-center justify-center cursor-pointer transition-colors hover:bg-input/30 data-[active=true]:bg-input/30"
                  >
                    <img
                      src={engine.icon}
                      alt={engine.name}
                      class="size-4 object-contain"
                    />
                  </button>
                {/each}
              </div>
              <input
                type="text"
                bind:value={storage.settings.searchEngine}
                oninput={(e) =>
                  storage.updateSetting("searchEngine", e.target.value)}
                placeholder="Search engine URL with %s as query"
                class="w-full h-8 px-2.5 rounded-lg bg-input/30 border border-input outline-none placeholder:text-muted"
              />
            </div>
          </div>
        {/if}
      </div>

      <div class="flex flex-col gap-2 shrink-0">
        <div class="flex flex-col">
          <span>Panic Key</span>
          <span class="text-xs text-muted"
            >Emergency keybind & redirect URL</span
          >
        </div>
        <div class="flex gap-1.5">
          <button
            onclick={() => (recordingKey = !recordingKey)}
            class="w-24 h-8 px-2.5 rounded-lg border border-input flex items-center justify-center cursor-pointer shrink-0 outline-0 bg-input/30"
          >
            {#if recordingKey}
              Press key...
            {:else if storage.settings.panicKey}
              {storage.settings.panicKey === " "
                ? "Space"
                : storage.settings.panicKey}
            {:else}
              Set Key
            {/if}
          </button>
          <input
            type="text"
            bind:value={storage.settings.panicURL}
            oninput={(e) => storage.updateSetting("panicURL", e.target.value)}
            placeholder="Panic URL"
            class="flex-1 h-8 px-2.5 rounded-lg bg-input/30 border border-input outline-none placeholder:text-muted"
          />
        </div>
      </div>

      <div class="flex flex-col gap-2 shrink-0">
        <div class="flex flex-col">
          <span>Transport & Wisp</span>
          <span class="text-xs text-muted">Transport backend and Wisp URL</span>
        </div>
        <div class="flex gap-1.5">
          <div
            class="flex bg-input/30 border border-input rounded-lg h-8 p-1 shrink-0"
          >
            <button
              onclick={() => (
                (transport = "epoxy"),
                storage.updateSetting("transport", "epoxy")
              )}
              class={"px-2 rounded-md transition-colors cursor-pointer " +
                (transport === "epoxy" ? "bg-input" : "")}
            >
              Epoxy
            </button>
            <button
              onclick={() => (
                (transport = "libcurl"),
                storage.updateSetting("transport", transport)
              )}
              class={"px-2 rounded-md transition-colors cursor-pointer " +
                (transport === "libcurl" ? "bg-input" : "")}
            >
              Libcurl
            </button>
          </div>
          <input
            type="text"
            value={wisp === defaultWisp ? "" : wisp}
            oninput={(e) => {
              wisp = e.target.value || defaultWisp;
              storage.updateSetting("wisp", wisp);
            }}
            placeholder={defaultWisp}
            class="flex-1 min-w-0 h-8 px-2.5 rounded-lg bg-input/30 border border-input outline-none placeholder:text-muted"
          />
        </div>
      </div>

      <div class="flex flex-col shrink-0">
        <div class="flex flex-col mb-2">
          <span>Privacy</span>
          <span class="text-xs text-muted">Advanced privacy options</span>
        </div>
        <button
          onclick={() => toggleSection("advanced")}
          class="w-full h-8 shrink-0 px-2.5 rounded-lg bg-input/30 border border-input flex items-center justify-between cursor-pointer"
        >
          <div class="flex items-center gap-2.5">
            <ShieldCheck size="16" class="text-muted" />
            <div class="flex items-center gap-2.5">Privacy Settings</div>
          </div>
          <ChevronDown
            size="16"
            class={"text-muted transition-transform duration-200 " +
              (openSection === "advanced" ? "rotate-180" : "")}
          />
        </button>
        {#if openSection === "advanced"}
          <div
            transition:slide={{ duration: 200 }}
            class="overflow-hidden shrink-0"
          >
            <div class="flex flex-col gap-2 pt-2">
              <div class="flex items-center justify-between gap-4 shrink-0">
                <div class="flex flex-col">
                  <span>Adblock</span>
                  <span class="text-xs text-muted"
                    >Block known dangerous hosts</span
                  >
                </div>
                <Switch
                  aria-label="Adblock"
                  checked={storage.settings.adblock}
                  onchange={(e) =>
                    storage.updateSetting("adblock", e.target.checked)}
                />
              </div>
              <div class="flex items-center justify-between gap-4 shrink-0">
                <div class="flex flex-col">
                  <span>Cache Sites</span>
                  <span class="text-xs text-muted"
                    >Cache website data to the browser</span
                  >
                </div>
                <Switch
                  aria-label="Cache"
                  checked={storage.settings.cache}
                  onchange={(e) =>
                    storage.updateSetting("cache", e.target.checked)}
                />
              </div>
              <div class="flex items-center justify-between gap-4 shrink-0">
                <div class="flex flex-col">
                  <span>History</span>
                  <span class="text-xs text-muted"
                    >Save search history in browser</span
                  >
                </div>
                <Switch
                  aria-label="History"
                  checked={storage.settings.history}
                  onchange={(e) => historyToggle(e.target.checked)}
                />
              </div>
              <div class="flex items-center justify-between gap-4 shrink-0">
                <div class="flex flex-col">
                  <span>about:blank Cloak</span>
                  <span class="text-xs text-muted"
                    >Open in an about:blank window</span
                  >
                </div>
                <button
                  onclick={aboutBlankCloak}
                  class="h-8 px-2.5 rounded-lg border border-input flex items-center justify-center cursor-pointer shrink-0 outline-0 bg-input/30"
                >
                  Open
                </button>
              </div>
              <div class="flex items-center justify-between gap-4 shrink-0">
                <div class="flex flex-col">
                  <span>Clear Data</span>
                  <span class="text-xs text-muted">Delete stored data</span>
                </div>
                <div class="flex gap-1.5">
                  <button
                    onclick={handleResetHistory}
                    class="w-[68.3203px] h-8 px-2.5 rounded-lg border border-input flex items-center justify-center cursor-pointer shrink-0 outline-0 bg-input/30"
                  >
                    {#if clearedHistory}
                      <Check size="15" />
                    {:else}
                      <span>History</span>
                    {/if}
                  </button>
                  <button
                    onclick={handleClearSiteData}
                    class="w-[80.6562px] h-8 px-2.5 rounded-lg border border-input flex items-center justify-center cursor-pointer shrink-0 outline-0 bg-input/30"
                  >
                    {#if clearedSiteData}
                      <Check size="15" />
                    {:else}
                      <span>Site Data</span>
                    {/if}
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
