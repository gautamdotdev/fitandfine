const CACHE_RESET_FLAG = "FIT & FINE-cache-reset";
const AUTH_STORAGE_KEYS = ["token", "user"];

export function markCacheReset() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CACHE_RESET_FLAG, "1");
}

export function consumeCacheResetFlag() {
  if (typeof window === "undefined") return false;

  const flag = sessionStorage.getItem(CACHE_RESET_FLAG) === "1";
  if (flag) {
    sessionStorage.removeItem(CACHE_RESET_FLAG);
  }

  return flag;
}

async function clearCacheStorage() {
  if (typeof window === "undefined" || !("caches" in window)) return;

  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
}

async function unregisterServiceWorkers() {
  if (
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator) ||
    !navigator.serviceWorker.getRegistrations
  ) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations.map((registration) => registration.unregister()),
  );
}

async function clearIndexedDB() {
  if (typeof indexedDB === "undefined" || !indexedDB.databases) return;

  const databases = await indexedDB.databases();
  await Promise.all(
    databases
      .map((database) => database?.name)
      .filter(Boolean)
      .map(
        (name) =>
          new Promise((resolve) => {
            const request = indexedDB.deleteDatabase(name);
            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
            request.onblocked = () => resolve();
          }),
      ),
  );
}

export async function clearWebsiteData({ preserveAuth = true } = {}) {
  if (typeof window === "undefined") return;

  const preservedAuth = preserveAuth
    ? AUTH_STORAGE_KEYS.reduce((entries, key) => {
        const value = localStorage.getItem(key);
        if (value !== null) entries[key] = value;
        return entries;
      }, {})
    : {};

  try {
    localStorage.clear();
  } catch {
    // Ignore storage access issues and continue with the reset.
  }

  if (preserveAuth) {
    for (const [key, value] of Object.entries(preservedAuth)) {
      localStorage.setItem(key, value);
    }
  }

  try {
    sessionStorage.clear();
  } catch {
    // Ignore storage access issues and continue with the reset.
  }

  await Promise.all([
    clearCacheStorage(),
    unregisterServiceWorkers(),
    clearIndexedDB(),
  ]);

  markCacheReset();
  window.location.reload();
}
