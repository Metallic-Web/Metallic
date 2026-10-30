<script>
  import { twMerge } from "tailwind-merge";
  import { tv } from "tailwind-variants";

  let { class: className, disabled, ...restProps } = $props();

  const card = tv({
    base: "appearance-none cursor-pointer transition-colors bg-input/80 checked:bg-foreground w-8 h-4.5 rounded-full flex items-center before:content-[''] before:h-4 before:w-4 before:rounded-full before:bg-foreground checked:before:bg-card before:block before:translate-x-0.25 checked:before:translate-x-3.75 before:transition-[translate,background,border] shrink-0 disabled:opacity-50 disabled:cursor-default",
  });
</script>

<input
  class={twMerge(card(), className)}
  {disabled}
  {...restProps}
  type="checkbox"
/>
