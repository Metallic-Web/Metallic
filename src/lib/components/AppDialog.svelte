<script>
  import AlertDialog from "#lib/components/ui/AlertDialog.svelte";
  import AlertDialogClose from "#lib/components/ui/AlertDialogClose.svelte";
  import AlertDialogContent from "#lib/components/ui/AlertDialogContent.svelte";
  import AlertDialogTrigger from "#lib/components/ui/AlertDialogTrigger.svelte";
  import { storage } from "#lib/storage.svelte.js";
  import { fetchIcon, isUrl, normalizeUrl } from "#lib/utils.js";
  import { Globe } from "@lucide/svelte";

  let { chemical, ready } = $props();

  let triggerEl = $state();
  let closeEl = $state();
  let editingApp = $state(null);
  let name = $state("");
  let url = $state("");
  let icon = $state("");
  let timer;

  export function openAdd(defaultName, defaultURL) {
    if (storage.apps.length >= 12) return;
    clearTimeout(timer);
    editingApp = null;
    name = defaultName || "";
    url = defaultURL || "";
    icon = "";
    if (defaultURL) {
      handleUrlInput(url);
    }
    triggerEl?.click();
  }

  export function openEdit(app) {
    clearTimeout(timer);
    editingApp = app;
    name = app.name;
    url = app.url;
    icon = app.icon || "";
    triggerEl?.click();
  }

  function handleUrlInput(val) {
    url = val;
    clearTimeout(timer);

    if (!isUrl(val)) {
      icon = "";
      return;
    }

    timer = setTimeout(async () => {
      if (!ready) return;
      const fetched = await fetchIcon(chemical, val);
      if (url === val) icon = fetched;
    }, 250);
  }

  async function save() {
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();
    if (!trimmedName || !trimmedUrl) return;

    const finalUrl = normalizeUrl(trimmedUrl);
    const preview = icon;

    if (editingApp) {
      const targetId = editingApp.id;
      const urlChanged = finalUrl !== editingApp.url;

      storage.editApp(targetId, {
        name: trimmedName,
        url: finalUrl,
        icon: preview || (urlChanged ? "" : editingApp.icon),
      });
      closeEl?.click();

      if (urlChanged && !preview && ready) {
        const fetched = await fetchIcon(chemical, finalUrl);
        if (fetched) storage.editApp(targetId, { icon: fetched });
      }
    } else {
      if (storage.apps.length >= 12) {
        closeEl?.click();
        return;
      }

      const id = storage.addApp({
        name: trimmedName,
        url: finalUrl,
        icon: preview || "",
      });
      closeEl?.click();

      if (!preview && ready) {
        const fetched = await fetchIcon(chemical, finalUrl);
        if (fetched) storage.editApp(id, { icon: fetched });
      }
    }
  }

  function handleKeydown(e) {
    if (e.key === "Enter" && name.trim() && url.trim()) {
      e.preventDefault();
      save();
    }
  }
</script>

<AlertDialog>
  <AlertDialogTrigger>
    <button
      bind:this={triggerEl}
      type="button"
      class="hidden"
      aria-hidden="true"
    ></button>
  </AlertDialogTrigger>
  <AlertDialogContent class="w-md text-sm bg-secondary/60">
    <p>{editingApp ? "Edit App" : "Add App"}</p>
    <div class="flex items-center gap-2.5">
      <div
        class="size-18 shrink-0 bg-secondary rounded-lg border border-input flex items-center justify-center"
      >
        {#if icon}
          <img
            src={icon}
            alt=""
            onerror={() => (icon = "")}
            class="size-9 rounded-sm object-contain"
          />
        {:else}
          <Globe class="text-muted" />
        {/if}
      </div>
      <div class="flex flex-col gap-2 w-full">
        <input
          bind:value={name}
          onkeydown={handleKeydown}
          class="w-full h-8 shrink-0 px-2.5 rounded-lg bg-input/30 border border-input outline-none placeholder:text-muted"
          placeholder="Name"
        />
        <input
          value={url}
          oninput={(e) => handleUrlInput(e.target.value)}
          onkeydown={handleKeydown}
          class="w-full h-8 shrink-0 px-2.5 rounded-lg bg-input/30 border border-input outline-none placeholder:text-muted"
          placeholder="URL"
        />
      </div>
    </div>
    <div class="w-full flex justify-end gap-2">
      <AlertDialogClose>
        <button
          bind:this={closeEl}
          type="button"
          class="h-8 px-2.5 rounded-lg border border-input flex items-center justify-center cursor-pointer shrink-0 outline-0 bg-input/30 text-sm"
        >
          Cancel
        </button>
      </AlertDialogClose>
      <button
        type="button"
        onclick={save}
        class="h-8 px-2.5 rounded-lg border border-input flex items-center justify-center cursor-pointer shrink-0 outline-0 bg-input/30 text-sm"
      >
        Done
      </button>
    </div>
  </AlertDialogContent>
</AlertDialog>
