<script>
  import { hiddenClass, randomLetter } from "#lib/utils";
  import { twMerge } from "tailwind-merge";

  let { class: className, text, ...restProps } = $props();

  const words = $derived(
    text.split(" ").map((word) => {
      const letters = word.split("");
      const newWord = [];

      for (let index in letters) {
        const letter = [];

        letter.push({
          hidden: true,
          letter: randomLetter(hiddenClass) + "\u00AD",
        });

        if (!Math.round(Math.random())) {
          if (!Math.round(Math.random())) {
            letter.push({
              hidden: false,
              letter: letters[index] + "\u00AD" + "\u200D",
            });
          } else {
            letter.push({
              hidden: false,
              letter: "\u200D" + letters[index] + "\u00AD",
            });
          }
        } else {
          letter.push({
            hidden: false,
            letter: letters[index] + "\u00AD",
          });
        }

        newWord.push(letter);
      }

      return newWord;
    }),
  );
</script>

<span
  class={twMerge(randomLetter(hiddenClass), "whitespace-nowrap", className)}
  {...restProps}
>
  {#each words as word}
    <span class={randomLetter(hiddenClass)}>
      {#each word as letters}
        <span class={randomLetter(hiddenClass)}>
          {#each letters as letter}
            {#if letter.hidden}
              <span class={hiddenClass}>{letter.letter}</span>
            {:else}
              <span class={randomLetter(hiddenClass)}>{letter.letter}</span>
            {/if}
          {/each}
        </span>
      {/each}
    </span>
  {/each}
</span>
