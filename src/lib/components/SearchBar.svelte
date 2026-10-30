<script>
  import { storage } from "#lib/storage.svelte.js";
  import { isUrl } from "#lib/utils.js";
  import {
    Calculator,
    Check,
    Copy,
    Globe,
    History,
    RotateCcwClock,
    Search,
    X,
  } from "@lucide/svelte";

  let {
    chemical,
    dropdownOpen = $bindable(false),
    onsearch,
    onfocusinput,
  } = $props();

  let query = $state("");
  let suggestions = $state([]);
  let focused = $state(false);
  let container = $state();
  let copied = $state(false);
  let timeoutId = null;

  const recentHistory = $derived(storage.history.slice(0, 6));

  const mode = $derived(
    !focused
      ? null
      : query.trim() && suggestions.length > 0
        ? "suggestions"
        : recentHistory.length > 0
          ? "history"
          : null,
  );

  $effect(() => {
    dropdownOpen = mode !== null;
  });

  async function handleInput(e) {
    const val = e.target.value;
    if (!val.trim()) {
      suggestions = [];
      return;
    }
    onfocusinput?.();
    if (chemical) {
      const results = await chemical.autocomplete(val);
      if (query === val) {
        suggestions = results.slice(0, 6);
      }
    }
  }

  function submit(target) {
    if (!target) return;
    focused = false;
    query = "";
    suggestions = [];
    onsearch?.(target);
  }

  function handleKeydown(e) {
    if (e.key === "Enter" && query.trim()) {
      submit(query);
      e.target.blur();
    } else if (e.key === "Escape") {
      focused = false;
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
    if (focused && container && !container.contains(e.target)) focused = false;
  }}
/>

<div bind:this={container} class="relative flex items-center flex-col">
  <div
    class="bg-input/30 border border-input rounded-full flex items-center w-3xl max-w-[calc(100vw-8rem)] h-13 pr-2"
  >
    <div class="flex justify-center items-center p-2 h-full aspect-square">
      <Search size="18" class="text-muted" />
    </div>
    <input
      bind:value={query}
      onfocus={() => {
        focused = true;
        onfocusinput?.();
      }}
      onkeydown={handleKeydown}
      oninput={handleInput}
      placeholder="Search or Type URL"
      class="w-full h-full bg-transparent outline-none placeholder:text-muted"
    />
  </div>

  {#if mode}
    <div
      class="absolute top-full w-3xl max-w-[calc(100vw-8rem)] flex flex-col items-center z-20"
    >
      {#if mode === "history"}
        {#each recentHistory as item}
          <div
            onclick={() => submit(item)}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === "Enter" && submit(item)}
            class="text-left w-full h-12 cursor-pointer flex items-center gap-2 px-2.75"
          >
            <div class="size-8 flex items-center justify-center shrink-0">
              <History class="text-muted" size="18" />
            </div>
            <div
              class="h-full w-full min-w-0 flex items-center justify-between gap-2 border-b border-border pr-1"
            >
              <span class="truncate">{item}</span>
              <button
                type="button"
                aria-label="Remove from history"
                onclick={(e) => {
                  e.stopPropagation();
                  storage.removeHistory(item);
                }}
                class="size-7 rounded-full flex items-center justify-center text-muted hover:text-primary hover:bg-secondary/50 transition-colors cursor-pointer shrink-0"
              >
                <X size="15" />
              </button>
            </div>
          </div>
        {/each}
      {:else}
        {#each suggestions as suggestion}
          {#if suggestion.type === "math"}
            <button
              onclick={() => handleCopy(suggestion.data.result)}
              class="text-left w-full h-12 cursor-pointer flex items-center gap-2 px-2.75"
            >
              <div class="size-8 flex items-center justify-center shrink-0">
                <Calculator class="text-muted" size="18" />
              </div>
              <div
                class="h-full w-full min-w-0 flex items-center justify-between gap-2 border-b border-border pr-1"
              >
                <div class="flex flex-col justify-center">
                  <p class="leading-4.5 truncate w-full">
                    {suggestion.data.result}
                  </p>
                  <p class="text-xs text-muted truncate w-full">
                    {suggestion.data.equation}
                  </p>
                </div>
                <div
                  class="size-7 rounded-full flex items-center justify-center text-muted hover:text-primary hover:bg-secondary/50 transition-colors cursor-pointer shrink-0"
                >
                  {#if copied}
                    <Check size="15" />
                  {:else}
                    <Copy size="15" />
                  {/if}
                </div>
              </div>
            </button>
          {:else if suggestion.type === "plain"}
            <button
              onclick={() => submit(suggestion.fullURL)}
              class="text-left w-full h-12 cursor-pointer flex items-center gap-2 px-2.75"
            >
              <div class="size-8 flex items-center justify-center shrink-0">
                {#if storage.isInHistory(suggestion.fullURL)}
                  <RotateCcwClock class="text-muted" size="18" />
                {:else if isUrl(suggestion.fullURL)}
                  <Globe class="text-muted" size="18" />
                {:else}
                  <Search class="text-muted" size="18" />
                {/if}
              </div>
              <div
                class="h-full w-full min-w-0 flex items-center border-b border-border"
              >
                <span class="truncate block w-full">
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
              onclick={() => submit(suggestion.data.title)}
              class="text-left w-full h-12 cursor-pointer flex items-center gap-2 px-2.75"
            >
              <div class="size-8 flex items-center justify-center shrink-0">
                {#if storage.isInHistory(suggestion.data.title)}
                  <History class="text-muted" size="18" />
                {:else if suggestion.data.image}
                  <img
                    class="w-6 rounded-sm"
                    alt={suggestion.data.title}
                    src={suggestion.data.image}
                  />
                {:else}
                  <Search class="text-muted" size="18" />
                {/if}
              </div>
              <div
                class="h-full w-full min-w-0 flex flex-col justify-center border-b border-border"
              >
                <p class="leading-4.5 truncate w-full">
                  {suggestion.data.title}
                </p>
                {#if suggestion.data.description}
                  <p class="text-xs text-muted truncate w-full">
                    {suggestion.data.description}
                  </p>
                {/if}
              </div>
            </button>
          {/if}
        {/each}
      {/if}
    </div>
  {/if}
</div>
