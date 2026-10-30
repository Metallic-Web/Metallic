export function initObsidian() {
  if (!localStorage.getItem("playobsidian.com@theme")) {
    localStorage.setItem("playobsidian.com@theme", "Metallic");
  }

  localStorage.setItem("playobsidian.com@libraryModeDismissed", "true");

  const raw = localStorage.getItem("playobsidian.com@settings");
  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw);
      parsed.libraryMode = true;
      parsed.launch = "currentTab";
      localStorage.setItem("playobsidian.com@settings", JSON.stringify(parsed));
      return;
    } catch {}
  }

  localStorage.setItem(
    "playobsidian.com@settings",
    JSON.stringify({
      sidebarCollapsed: false,
      sidebarSort: "alphabetical",
      sortBy: "alphabetical",
      maskTitle: "",
      maskIcon: "",
      autoMask: false,
      panicKey: "",
      panicURL: "",
      aspect: "",
      closePrevention: false,
      customCSS: "",
      cards: "default",
      overlay: "default",
      launch: "currentTab",
      libraryMode: true,
    }),
  );
}
