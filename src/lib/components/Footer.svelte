<script>
  import { links } from "#lib/links";
  import { SiDiscord, SiGithub } from "@icons-pack/svelte-simple-icons";
</script>

<footer
  class="footer pb-4 px-4 mt-auto flex gap-4 justify-between pt-16 text-sm"
>
  <div class="flex items-center gap-2">
    <p>Metallic {new Date().getFullYear()}</p>
  </div>

  <div class="flex items-center gap-4">
  <a class="text-muted hover:underline" href={"mailto:" + links.email}>Contact</a>
    <a class="text-muted hover:underline" href="/terms">Terms of Service</a>
    <a class="text-muted hover:underline" href="/privacy">Privacy Policy</a>
    <div class="flex items-center gap-6 mx-2">
      <a class="text-muted hover:underline" href={links.github}>
        <SiGithub title="Github" size="16" />
      </a>
      <a class="text-muted hover:underline" href={links.discord}>
        <SiDiscord title="Discord" size="16" />
      </a>
    </div>
  </div>
</footer>
