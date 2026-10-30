<script>
  import Head from "#lib/components/Head.svelte";
  import Obfuscate from "#lib/components/Obfuscate.svelte";
  import { links } from "#lib/links.js";

  let updated = new Date(1793244940602);
</script>

<Head title="Privacy Policy" />

<div class="mt-12 p-4 flex flex-col gap-4 text-sm">
  <div class="flex flex-col">
    <p class="text-base">Privacy Policy</p>
    <p class="text-muted">
      Last updated on {updated.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
    </p>
  </div>
  <p>
    At Metallic, we prioritize your privacy. This Privacy Policy explains how
    information is handled when you use our website, <Obfuscate text="web proxy"
    ></Obfuscate>, and embedded <Obfuscate text="games"></Obfuscate> and applications.
  </p>
  <p class="text-base">1. Local Device Storage</p>
  <p>
    Metallic does not require user accounts and stores your personal preferences
    directly on your device using browser local storage:
  </p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>
      <p>Search History & Pinned Apps:</p>
      Your search history, custom pinned apps, and cached Base64 favicons are saved
      locally in your browser and are never uploaded to our servers. You can delete
      individual history items or apps at any time.
    </li>
    <li>
      <p>Customization & Settings:</p>
      Theme selections, tab mask configurations, panic keybinds, and custom Wisp server
      URLs remain strictly on your device.
    </li>
  </ul>
  <p class="text-base">2. Network & Proxy Traffic</p>
  <p>
    When you browse websites, fetch app icons, or request autocomplete
    suggestions through Metallic:
  </p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>
      <p>Wisp Transport:</p>
      Network requests made inside the browser frame are routed through your configured
      Wisp WebSocket endpoint using Epoxy or Libcurl client-side transports.
    </li>
    <li>
      <p>Custom Wisp Servers:</p>
      If you configure a custom Wisp server URL in Settings, your traffic is routed
      through that third-party server and is subject to its operator's logging and
      privacy practices.
    </li>
  </ul>
  <p class="text-base">3. Third-Party Services</p>
  <p>
    When you type queries or visit external websites through Metallic, those
    requests are sent to your selected search provider (such as Google,
    DuckDuckGo, Bing, Brave, or Yahoo) or the destination website. We do not
    control the data collection or cookies used by third-party sites accessed
    within the browser frame.
  </p>
  <p class="text-base">4. Data Security & Control</p>
  <p>
    Because your history, settings, and service worker caches are stored locally
    in your browser, you retain full control over your data. Clearing your
    browser's site data or local storage will permanently remove all saved
    Metallic history, custom apps, and preferences from your device.
  </p>
  <p class="text-base">5. Changes to This Policy</p>
  <p>
    We may update this Privacy Policy from time to time. Any changes will be
    reflected on this page with an updated revision date.
  </p>
  <p class="text-base">6. Contact Us</p>
  <p>
    If you have any questions or concerns about this Privacy Policy, please
    contact us at <a class="hover:underline" href={"mailto:" + links.email}
      >{links.email}</a
    >.
  </p>
</div>
