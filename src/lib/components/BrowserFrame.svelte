<script>
  import { storage } from "#lib/storage.svelte.js";
  import { isUrl, normalizeUrl } from "#lib/utils.js";
  import {
    ArrowLeft,
    ArrowRight,
    Calculator,
    Check,
    Copy,
    Globe,
    History,
    Maximize,
    RotateCcwClock,
    RotateCw,
    Search,
    Star,
    X,
  } from "@lucide/svelte";
  import Frame from "chemicaljs/Frame";
  import AppDialog from "./AppDialog.svelte";

  let {
    chemical = $bindable(),
    ready = $bindable(false),
    open = $bindable(false),
  } = $props();

  let frame = $state();
  let url = $state("");
  let originalInput = $state("");
  let suggestions = $state([]);
  let focused = $state(false);
  let typing = $state(false);
  let selectedIndex = $state(-1);
  let container = $state();
  let appDialog = $state();
  let inputEl = $state();
  let copied = $state(false);
  let timeoutId = null;

  const recentHistory = $derived(storage.history.slice(0, 6));

  const mode = $derived(
    !focused
      ? null
      : typing && suggestions.length > 0
        ? "suggestions"
        : recentHistory.length > 0
          ? "history"
          : null,
  );

  function getItemText(item) {
    if (item.type === "math") return item.data.result;
    if (item.type === "rich") return item.data.title;
    return item.fullURL;
  }

  export function navigate(targetUrl, saveToHistory = true) {
    if (saveToHistory && targetUrl) storage.addHistory(targetUrl);
    url = targetUrl;
    originalInput = targetUrl;
    focused = false;
    typing = false;
    selectedIndex = -1;
    frame.go(targetUrl, {
      autoHttps: true,
      searchEngine: storage.settings.searchEngine,
    });
    open = true;
  }

  function close() {
    frame.reset();
    open = false;
    url = "";
    originalInput = "";
    suggestions = [];
    focused = false;
    typing = false;
    selectedIndex = -1;
  }

  async function handleInput(e) {
    const val = e.target.value;
    originalInput = val;
    if (!val.trim()) {
      typing = false;
      suggestions = [];
      selectedIndex = -1;
      return;
    }
    typing = true;
    if (chemical) {
      selectedIndex = 0;
      const results = await chemical.autocomplete(val);
      if (url !== val || !typing) return;

      const mathItem = results.find((item) => item.type === "math");
      const rest = results
        .filter((item) => {
          if (item.type === "math") return false;
          const text = getItemText(item);
          return text?.toLowerCase() !== val.toLowerCase();
        })
        .slice(0, mathItem ? 5 : 6);

      const rawItem = {
        type: "plain",
        data: [{ text: val, highlight: false }],
        fullURL: val,
      };

      suggestions = mathItem
        ? [mathItem, rawItem, ...rest]
        : [rawItem, ...rest];
    }
  }

  function handleKeydown(e) {
    const list =
      mode === "suggestions"
        ? suggestions
        : mode === "history"
          ? recentHistory.map((h) => ({ type: "history", fullURL: h }))
          : [];

    if (focused && list.length > 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex =
          e.key === "ArrowDown"
            ? (selectedIndex + 1) % list.length
            : selectedIndex <= 0
              ? list.length - 1
              : selectedIndex - 1;
        const item = list[selectedIndex];
        url = getItemText(item);
        return;
      }
    }

    if (e.key === "Enter" && (url || "").trim()) {
      const selected = list[selectedIndex];
      if (mode === "suggestions" && selected?.type === "math") {
        e.preventDefault();
        handleCopy(selected.data.result);
        return;
      }
      navigate(url, true);
      e.target.blur();
    } else if (e.key === "Escape") {
      url = originalInput;
      focused = false;
      typing = false;
      selectedIndex = -1;
      e.target.blur();
    }
  }

  function handleCopy(result) {
    navigator.clipboard.writeText(result);
    copied = true;

    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<svelte:window
  onpointerdown={(e) => {
    if (focused && container && !container.contains(e.target)) {
      focused = false;
      typing = false;
      selectedIndex = -1;
    }
  }}
/>

<AppDialog bind:this={appDialog} {chemical} {ready} />

<div class={open ? "bg-background fixed inset-0 z-30 flex flex-col" : "hidden"}>
  <div
    class="h-12 px-2 flex items-center gap-2 border-b border-border bg-background relative z-40"
  >
    <button
      aria-label="Back"
      class="group rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-secondary size-8 shrink-0"
      onclick={() => frame.back()}
    >
      <ArrowLeft
        size="16"
        class="transition-transform duration-150 group-active:-translate-x-0.5"
      />
    </button>
    <button
      aria-label="Forward"
      class="group rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-secondary size-8 shrink-0"
      onclick={() => frame.forward()}
    >
      <ArrowRight
        size="16"
        class="transition-transform duration-150 group-active:translate-x-0.5"
      />
    </button>
    <button
      aria-label="Reload"
      class="group rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-secondary size-8 shrink-0"
      onclick={() => frame.reload()}
    >
      <RotateCw
        size="14"
        class="transition-transform duration-150 group-active:rotate-45"
      />
    </button>

    <div bind:this={container} class="relative flex-1 h-8">
      <div
        class="absolute top-0 left-0 right-0 rounded-2xl border border-input bg-background overflow-hidden flex flex-col z-50"
      >
        <div class="flex items-center h-7.5 text-sm w-full bg-input/30">
          <div class="flex justify-center items-center w-8 h-full shrink-0">
            <Search size="16" class="text-muted" />
          </div>
          <input
            bind:this={inputEl}
            bind:value={url}
            onfocus={() => {
              focused = true;
              typing = (url || "").trim().length > 0 && suggestions.length > 0;
              selectedIndex = typing ? 0 : -1;
            }}
            onkeydown={handleKeydown}
            oninput={handleInput}
            placeholder="Search or Type URL"
            class="w-full h-full pr-2 bg-transparent outline-none placeholder:text-muted"
          />
          <button
            disabled={storage.apps.length >= 12}
            onclick={() => appDialog.openAdd(frame.getTitle(), url)}
            class="flex justify-center items-center size-6 mr-1 shrink-0 cursor-pointer hover:bg-input/30 rounded-full disabled:opacity-50 disabled:cursor-default disabled:hover:bg-transparent outline-none"
          >
            <Star size="16" class="text-muted" />
          </button>
        </div>

        {#if mode}
          <div class="flex flex-col w-full bg-input/30 border-t border-input">
            {#if mode === "history"}
              {#each recentHistory as item, i}
                <div
                  onclick={() => navigate(item, true)}
                  onmouseenter={() => (selectedIndex = i)}
                  role="button"
                  tabindex="0"
                  onkeydown={(e) => e.key === "Enter" && navigate(item, true)}
                  class={"text-left w-full h-8 cursor-pointer flex items-center justify-between pr-1.5 transition-colors " +
                    (selectedIndex === i ? "bg-input/30" : "hover:bg-input/30")}
                >
                  <div class="flex items-center h-full min-w-0 flex-1">
                    <div
                      class="size-8 flex items-center justify-center shrink-0"
                    >
                      <History class="text-muted" size="16" />
                    </div>
                    <span class="text-sm truncate">{item}</span>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove from history"
                    onclick={(e) => {
                      e.stopPropagation();
                      storage.removeHistory(item);
                    }}
                    class="size-6 rounded-full flex items-center justify-center text-muted hover:bg-input/30 transition-colors cursor-pointer shrink-0"
                  >
                    <X size="14" />
                  </button>
                </div>
              {/each}
            {:else}
              {#each suggestions as suggestion, i}
                {#if suggestion.type === "math"}
                  <button
                    onclick={() => handleCopy(suggestion.data.result)}
                    onmouseenter={() => (selectedIndex = i)}
                    class={"text-left w-full h-8 pr-1.5 cursor-pointer flex items-center transition-colors " +
                      (selectedIndex === i
                        ? "bg-input/30"
                        : "hover:bg-input/30")}
                  >
                    <div
                      class="size-8 flex items-center justify-center shrink-0"
                    >
                      <Calculator class="text-muted" size="15" />
                    </div>
                    <div
                      class="h-full w-full min-w-0 flex items-center justify-between text-sm"
                    >
                      <p class="leading-4.5 truncate">
                        <span>{suggestion.data.equation}</span>
                        <span>= {suggestion.data.result}</span>
                      </p>
                      <div
                        class="size-6 rounded-full flex items-center justify-center text-muted hover:bg-input/30 transition-colors cursor-pointer shrink-0"
                      >
                        {#if copied}
                          <Check size="14" />
                        {:else}
                          <Copy size="14" />
                        {/if}
                      </div>
                    </div>
                  </button>
                {:else if suggestion.type === "plain"}
                  <button
                    onclick={() => navigate(suggestion.fullURL, true)}
                    onmouseenter={() => (selectedIndex = i)}
                    class={"text-left w-full h-8 cursor-pointer flex items-center transition-colors " +
                      (selectedIndex === i
                        ? "bg-input/30"
                        : "hover:bg-input/30")}
                  >
                    <div
                      class="size-8 flex items-center justify-center shrink-0"
                    >
                      {#if storage.isInHistory(suggestion.fullURL)}
                        <RotateCcwClock class="text-muted" size="16" />
                      {:else if isUrl(suggestion.fullURL)}
                        <Globe class="text-muted" size="16" />
                      {:else}
                        <Search class="text-muted" size="16" />
                      {/if}
                    </div>
                    <div
                      class="h-full w-full min-w-0 flex items-center text-sm"
                    >
                      <span class="truncate w-full">
                        {#each suggestion.data as part}
                          {#if part.highlight}
                            <b>{part.text}</b>
                          {:else}
                            <span>{part.text}</span>
                          {/if}
                        {/each}
                      </span>
                    </div>
                  </button>
                {:else if suggestion.type === "rich"}
                  <button
                    onclick={() => navigate(suggestion.data.title, true)}
                    onmouseenter={() => (selectedIndex = i)}
                    class={"text-left w-full h-8 cursor-pointer flex items-center transition-colors " +
                      (selectedIndex === i
                        ? "bg-input/30"
                        : "hover:bg-input/30")}
                  >
                    <div
                      class="size-8 flex items-center justify-center shrink-0"
                    >
                      {#if storage.isInHistory(suggestion.data.title)}
                        <History class="text-muted" size="16" />
                      {:else if suggestion.data.image}
                        <img
                          class="w-4 rounded-sm"
                          alt={suggestion.data.title}
                          src={suggestion.data.image}
                        />
                      {:else}
                        <Search class="text-muted" size="16" />
                      {/if}
                    </div>
                    <div
                      class="h-full w-full min-w-0 flex items-center text-sm"
                    >
                      <p class="leading-4.5 truncate w-full">
                        {suggestion.data.title}
                        {#if suggestion.data.description}
                          <span class="text-muted">
                            <span class="ml-1">-</span>
                            {suggestion.data.description}
                          </span>
                        {/if}
                      </p>
                    </div>
                  </button>
                {/if}
              {/each}
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <button
      aria-label="Fullscreen"
      class="rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-secondary size-8 shrink-0"
      onclick={() => frame.fullscreen()}
    >
      <Maximize size="14" />
    </button>

    <button
      aria-label="Close Frame"
      class="rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-secondary size-8 shrink-0"
      onclick={close}
    >
      <X size="16" />
    </button>
  </div>

  <Frame
    cache={false}
    adblock={true}
    onpointerdown={() => {
      focused = false;
      typing = false;
      selectedIndex = -1;
      inputEl?.blur();
    }}
    onkeydown={(e) => {
      const tag = e.target?.tagName;
      if (
        tag !== "INPUT" &&
        tag !== "TEXTAREA" &&
        !e.target?.isContentEditable &&
        storage.settings.panicKey &&
        storage.settings.panicURL &&
        e.key === storage.settings.panicKey
      ) {
        window.location.replace(normalizeUrl(storage.settings.panicURL));
      }
    }}
    onchange={(newURL) => {
      url = newURL;
      originalInput = newURL;
    }}
    catchlinks={() =>
      new URL(location.pathname + location.search, location.origin)}
    class="w-full flex-1 border-none"
    bind:this={frame}
    bind:ready
    bind:chemical
  ></Frame>
</div>
