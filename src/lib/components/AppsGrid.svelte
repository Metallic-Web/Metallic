<script>
  import ContextMenu from "#lib/components/ui/ContextMenu.svelte";
  import ContextMenuContent from "#lib/components/ui/ContextMenuContent.svelte";
  import ContextMenuItem from "#lib/components/ui/ContextMenuItem.svelte";
  import ContextMenuTrigger from "#lib/components/ui/ContextMenuTrigger.svelte";
  import { storage } from "#lib/storage.svelte.js";
  import { fetchIcon } from "#lib/utils.js";
  import { Pencil as Edit, Globe, Trash2 } from "@lucide/svelte";
  import { flip } from "svelte/animate";
  import { cubicOut } from "svelte/easing";

  let { chemical, ready, instantHide = false, onopenapp, oneditapp } = $props();

  let rowEl = $state();
  let draggingId = $state(null);
  let startX = 0;
  let startY = 0;
  let isDragging = $state(false);
  const attemptedIds = new Set();

  function appFly(node, { delay = 0, duration = 400, y = 20 } = {}) {
    return {
      delay,
      duration,
      easing: cubicOut,
      css: (t, u) =>
        `opacity: ${t}; transform: ${u === 0 ? "none" : `translateY(${u * y}px)`};`,
    };
  }

  function appOut() {
    if (instantHide) return { duration: 0 };
    return { duration: 150, css: (t) => `opacity: ${t};` };
  }

  function getSlotIndex(clientX, clientY) {
    if (!rowEl) return -1;
    const total = Math.min(storage.apps.length, 12);
    if (!total) return -1;

    const rect = rowEl.getBoundingClientRect();
    const cardW = 96;
    const cardH = 122;
    const gap = 16;
    const cols = 6;

    const row = total > cols && clientY >= rect.top + cardH + gap / 2 ? 1 : 0;
    const col = Math.max(
      0,
      Math.min(
        cols - 1,
        Math.floor((clientX - rect.left + gap / 2) / (cardW + gap)),
      ),
    );

    return Math.min(total - 1, row * cols + col);
  }

  function handlePointerDown(e, id) {
    if (e.button !== 0) return;
    draggingId = id;
    startX = e.clientX;
    startY = e.clientY;
    isDragging = false;
  }

  function handlePointerMove(e) {
    if (!draggingId) return;
    if (!isDragging && Math.hypot(e.clientX - startX, e.clientY - startY) > 4) {
      isDragging = true;
    }
    if (isDragging) {
      const target = getSlotIndex(e.clientX, e.clientY);
      if (target !== -1) storage.moveApp(draggingId, target);
    }
  }

  function handlePointerUp() {
    if (!draggingId) return;
    draggingId = null;
    setTimeout(() => (isDragging = false), 0);
  }

  $effect(() => {
    if (!ready || !chemical) return;
    for (const app of storage.apps) {
      if (!app.icon && !attemptedIds.has(app.id)) {
        attemptedIds.add(app.id);
        fetchIcon(chemical, app.url).then((icon) => {
          if (icon) storage.editApp(app.id, { icon });
        });
      }
    }
  });
</script>

<svelte:window
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
/>

<svelte:body class:cursor-grabbing={isDragging} />

<div
  class="absolute top-full inset-x-0 pt-15 z-10 flex justify-center pointer-events-none"
>
  <div
    bind:this={rowEl}
    class="flex flex-wrap gap-4 w-max max-w-164 pointer-events-auto select-none"
  >
    {#each storage.apps.slice(0, 12) as app, i (app.id)}
      <div
        role="group"
        animate:flip={{ duration: 250, easing: cubicOut }}
        out:appOut|global
        onpointerdown={(e) => handlePointerDown(e, app.id)}
        class={"w-24 shrink-0 relative " +
          (draggingId === app.id ? "z-30" : "")}
      >
        <ContextMenu>
          <ContextMenuTrigger>
            <div in:appFly|global={{ y: 20, delay: i * 35, duration: 400 }}>
              <button
                type="button"
                onclick={() => !isDragging && onopenapp?.(app.url)}
                class={"w-24 flex flex-col gap-2 bg-input/30 rounded-lg p-2 text-sm border border-border transition-colors " +
                  (isDragging ? "cursor-grabbing" : "cursor-pointer")}
              >
                <div
                  class="aspect-square w-full bg-secondary rounded-sm flex items-center justify-center"
                >
                  {#if app.icon}
                    <img
                      src={app.icon}
                      draggable="false"
                      loading="lazy"
                      alt={app.name}
                      onerror={() => storage.editApp(app.id, { icon: "" })}
                      class="size-6 rounded-sm object-contain pointer-events-none"
                    />
                  {:else}
                    <Globe />
                  {/if}
                </div>
                <div class="w-full truncate text-center">{app.name}</div>
              </button>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onclick={() => oneditapp?.(app)}>
              <Edit size="16" />
              <span>Edit</span>
            </ContextMenuItem>
            <ContextMenuItem onclick={() => storage.removeApp(app.id)}>
              <Trash2 size="16" />
              <span>Remove</span>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    {/each}
  </div>
</div>
