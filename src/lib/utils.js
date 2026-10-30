export function randomLetter(not) {
  const random = String.fromCharCode(
    (!Math.round(Math.random()) ? 65 : 97) + Math.floor(Math.random() * 26),
  );

  if (random !== not) {
    return random;
  } else {
    return randomLetter(not);
  }
}

export const hiddenClass = randomLetter();

export function isUrl(str = "") {
  const s = str.trim();
  if (!s || s.includes(" ")) return false;
  return (
    /^(https?:\/\/)/i.test(s) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(s)
  );
}

export function normalizeUrl(url = "") {
  const s = url.trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

export async function fetchIcon(chemical, rawUrl) {
  if (!chemical || !rawUrl) return "";

  try {
    const url = normalizeUrl(rawUrl);
    let href = new URL("/favicon.ico", url).href;

    try {
      const res = await chemical.fetch(url);

      if (res.ok) {
        const doc = new DOMParser().parseFromString(
          await res.text(),
          "text/html",
        );
        const link =
          doc.querySelector('link[rel*="apple-touch-icon"][href]') ||
          doc.querySelector('link[rel*="icon"][href]');

        if (link) {
          href = new URL(link.getAttribute("href"), url).href;
        }
      } else {
        const manifestUrl = new URL("/manifest.json", url).href;
        const manifestRes = await chemical.fetch(manifestUrl);
        if (manifestRes.ok) {
          const manifest = await manifestRes.json();
          const iconPath = manifest.icons?.[manifest.icons.length - 1]?.src;
          if (iconPath) href = new URL(iconPath, manifestUrl).href;
        }
      }
    } catch {}

    const dataUrl = await chemical.createDataURL(href);
    if (dataUrl?.startsWith("data:image/")) {
      return dataUrl;
    }

    const fallbackUrl = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(url)}&size=64`;
    const fallbackResFetch = await chemical.fetch(fallbackUrl);
    const fallbackRes = await chemical.createDataURL(fallbackUrl);

    if (fallbackRes && fallbackResFetch.status === 200) {
      return fallbackRes;
    }

    return "";
  } catch {
    return "";
  }
}

export function clearSiteData() {
  const keysToPreserve = [
    "apps",
    "theme",
    "settings",
    "history",
    "playobsidian.com@theme",
    "playobsidian.com@libraryModeDismissed",
    "playobsidian.com@settings",
  ];

  const preservedData = {};
  keysToPreserve.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      preservedData[key] = value;
    }
  });

  localStorage.clear();

  Object.keys(preservedData).forEach((key) => {
    localStorage.setItem(key, preservedData[key]);
  });

  sessionStorage.clear();

  if (window.indexedDB && window.indexedDB.databases) {
    window.indexedDB
      .databases()
      .then((databases) => {
        databases.forEach((db) => {
          window.indexedDB.deleteDatabase(db.name);
        });
      })
      .catch((err) => console.error("Error clearing IndexedDB:", err));
  }

  document.cookie.split(";").forEach((cookie) => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
  });
}
