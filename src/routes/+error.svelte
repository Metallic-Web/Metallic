<script>
  import Head from "#lib/components/Head.svelte";
  import { page } from "$app/state";
  import { ArrowLeft, House } from "@lucide/svelte";
</script>

<Head title={page.status} />

<div class="w-full h-full flex flex-col items-center justify-center">
  <div class="flex flex-col items-center gap-2 text-center">
    <h1 class="font-semibold text-4xl tracking-wide text-primary">
      {page.status}
    </h1>
    <p class="text-sm text-muted mb-2">
      {page.status === 404
        ? "This page could not be found"
        : page.error?.message || "Something went wrong"}
    </p>

    <div class="flex items-center gap-2">
      <button
        type="button"
        onclick={() => history.back()}
        class="h-7 px-2.5 py-0.5 text-[0.8rem] rounded-full border border-input flex items-center cursor-pointer gap-1 transition-colors hover:bg-secondary"
      >
        <ArrowLeft size="14" />
        <span>Back</span>
      </button>
      <a
        href="/"
        class="h-7 px-2.5 py-0.5 text-[0.8rem] rounded-full border border-input flex items-center cursor-pointer gap-1 transition-colors hover:bg-secondary"
      >
        <House size="14" />
        <span>Home</span>
      </a>
    </div>
  </div>
</div>
