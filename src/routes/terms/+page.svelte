<script>
  import Head from "#lib/components/Head.svelte";
  import Obfuscate from "#lib/components/Obfuscate.svelte";
  import { links } from "#lib/links.js";

  let updated = new Date(1793244940602);
</script>

<Head title="Terms of Service" />

<div class="mt-12 p-4 flex flex-col gap-4 text-sm">
  <div class="flex flex-col">
    <p class="text-base">Terms of Service</p>
    <p class="text-muted">
      Last updated on {updated.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
    </p>
  </div>
  <p>
    Welcome to Metallic. By accessing or using our website, <Obfuscate
      text="web proxy"
    ></Obfuscate> services, and integrated applications, you agree to be bound by
    these Terms of Service. If you do not agree with any part of these terms, please
    do not use our site.
  </p>
  <p class="text-base">1. Local Storage & Configuration</p>
  <p>
    Metallic runs primarily in your browser, using local device storage to save
    your themes, tab masks, custom Wisp endpoints, search history, and pinned
    applications.
  </p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>
      <p>Data Responsibility:</p>
      You are solely responsible for the configuration, browsing history, and shortcut
      data stored locally in your browser.
    </li>
    <li>
      <p>Third-Party Destinations:</p>
      Metallic acts only as a client-side interface and <Obfuscate text="proxy"
      ></Obfuscate> tool. You are responsible for complying with the terms of any
      third-party websites, <Obfuscate text="games"></Obfuscate>, or Wisp
      servers you connect to through the platform.
    </li>
  </ul>
  <p class="text-base">2. Acceptable Use and Conduct</p>
  <p>
    You agree to use Metallic only for lawful purposes. Prohibited behavior
    includes, but is not limited to:
  </p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>
      Using the <Obfuscate text="proxy"></Obfuscate> or Wisp transport backends to
      conduct illegal activities, distribute malware, or attack external networks.
    </li>
    <li>
      Abusing, overloading, or attempting to disrupt our default Wisp servers or
      platform infrastructure with automated bots or scrapers.
    </li>
    <li>
      Attempting to bypass site security or exploit vulnerabilities within the
      application.
    </li>
  </ul>
  <p class="text-base">3. Third-Party Content & Intellectual Property</p>
  <p>
    Websites, <Obfuscate text="games"></Obfuscate>, favicons, and search engines
    accessed through Metallic are the property of their respective owners.
    Metallic does not host, control, or claim ownership over any external
    websites or third-party content rendered within the browser frame.
  </p>
  <p class="text-base">4. Access and Availability</p>
  <p>
    We reserve the right to restrict, rate-limit, or terminate access to the
    site and its default Wisp servers at our sole discretion, without notice,
    for any reason, including breach of these Terms of Service.
  </p>
  <p class="text-base">5. Disclaimer of Warranties</p>
  <p>
    Metallic is provided "as is". We make no warranties regarding the uptime of
    Wisp servers, the accuracy of autocomplete suggestions, or the security of
    third-party sites accessed through the <Obfuscate text="proxy"></Obfuscate>.
    We are not responsible for any loss of locally stored data, settings, or
    browsing state.
  </p>
  <p class="text-base">6. Limitation of Liability</p>
  <p>
    In no event shall Metallic or its operators be liable for any damages,
    network restrictions, or account actions arising out of your use or
    inability to use the site or any external services accessed through it.
  </p>
  <p class="text-base">7. Contact Us</p>
  <p>
    If you have any questions, concerns, or requests regarding these Terms of
    Service, please contact us at <a
      class="hover:underline"
      href={"mailto:" + links.email}>{links.email}</a
    >.
  </p>
</div>
