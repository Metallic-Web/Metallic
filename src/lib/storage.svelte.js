import defaultApps from "#lib/assets/apps.js";
import searchEngines from "chemicaljs/searchEngines";

function normalizeApps(list) {
  return list.map((app) => ({
    ...app,
    id: app.id || crypto.randomUUID(),
  }));
}

class StorageManager {
  isLoaded = $state(false);
  theme = $state("Metallic");
  history = $state([]);
  apps = $state(normalizeApps(defaultApps));
  settings = $state({
    transport: "epoxy",
    wisp: import.meta.env.VITE_WISP_URL
      ? import.meta.env.VITE_WISP_URL.replace("{host}", location.hostname)
      : `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/wisp/`,
    maskTitle: "",
    maskIcon: "",
    searchEngine: searchEngines.google,
    panicKey: "",
    panicURL: "",
    history: true,
    adblock: true,
    cache: true,
  });

  constructor() {
    if (typeof BroadcastChannel !== "undefined") {
      this.channel = new BroadcastChannel("storage-sync");
      this.channel.onmessage = ({ data }) => {
        if (data.type === "updateTheme") this.updateTheme(data.theme, false);
        if (data.type === "updateSetting")
          this.updateSetting(data.key, data.value, false);
        if (data.type === "updateHistory")
          this.updateHistory(data.history, false);
        if (data.type === "updateApps") this.updateApps(data.apps, false);
      };
    }
  }

  loadStorage() {
    const storedTheme = localStorage.getItem("theme");
    const storedSettings = localStorage.getItem("settings");
    const storedHistory = localStorage.getItem("history");
    const storedApps = localStorage.getItem("apps");

    if (storedTheme) this.theme = storedTheme.replace(/['"]+/g, "");
    document.documentElement.dataset.theme = this.theme;

    if (storedSettings) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(storedSettings) };
      } catch {}
    }

    if (storedHistory) {
      try {
        this.history = JSON.parse(storedHistory);
      } catch {}
    }

    if (storedApps) {
      try {
        this.apps = normalizeApps(JSON.parse(storedApps));
      } catch {}
    }

    this.isLoaded = true;
  }

  executeThemeSwap(theme, share) {
    this.theme = theme;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    if (share) this.channel?.postMessage({ type: "updateTheme", theme });
  }

  updateTheme(theme, share = true) {
    if (!document.startViewTransition) {
      this.executeThemeSwap(theme, share);
      return;
    }
    document.startViewTransition(() => this.executeThemeSwap(theme, share));
  }

  updateSetting(key, value, share = true) {
    this.settings = { ...this.settings, [key]: value };
    localStorage.setItem("settings", JSON.stringify(this.settings));
    if (share) this.channel?.postMessage({ type: "updateSetting", key, value });
  }

  updateHistory(history, share = true) {
    this.history = history;
    localStorage.setItem("history", JSON.stringify(this.history));
    if (share) {
      this.channel?.postMessage({
        type: "updateHistory",
        history: $state.snapshot(this.history),
      });
    }
  }

  addHistory(item) {
    if (!this.settings.history) {
      return;
    }

    const trimmed = item?.trim();
    if (!trimmed) return;
    const filtered = this.history.filter(
      (h) => h.toLowerCase() !== trimmed.toLowerCase(),
    );
    this.updateHistory([trimmed, ...filtered]);
  }

  removeHistory(item) {
    this.updateHistory(this.history.filter((h) => h !== item));
  }

  isInHistory(str) {
    if (!str) return false;
    const target = str.trim().toLowerCase();
    return this.history.some((h) => h.toLowerCase() === target);
  }

  updateApps(apps, share = true) {
    this.apps = apps;
    localStorage.setItem("apps", JSON.stringify(this.apps));
    if (share) {
      this.channel?.postMessage({
        type: "updateApps",
        apps: $state.snapshot(this.apps),
      });
    }
  }

  addApp(app) {
    const newApp = { ...app, id: crypto.randomUUID() };
    this.updateApps([...this.apps, newApp]);
    return newApp.id;
  }

  editApp(id, changes) {
    this.updateApps(
      this.apps.map((app) => (app.id === id ? { ...app, ...changes } : app)),
    );
  }

  removeApp(id) {
    this.updateApps(this.apps.filter((app) => app.id !== id));
  }

  moveApp(id, toIndex) {
    const fromIndex = this.apps.findIndex((a) => a.id === id);
    if (fromIndex === -1 || fromIndex === toIndex) return;
    const next = [...this.apps];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    this.updateApps(next);
  }
}

export const storage = new StorageManager();
