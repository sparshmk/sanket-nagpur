/**
 * Safe local storage manager with versioning and corrupted JSON fallback.
 */
const CURRENT_STORAGE_VERSION = 'v2_clean';
const STORAGE_PREFIX = `sanket_nagpur_${CURRENT_STORAGE_VERSION}_`;

// Auto-cleanup stale versions so any user or evaluator opening the site gets pristine demo data
function ensureCurrentVersion() {
  try {
    const storedVersion = localStorage.getItem('sanket_version_tracker');
    if (storedVersion !== CURRENT_STORAGE_VERSION) {
      // Purge all old sanket items
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('sanket_')) {
          localStorage.removeItem(k);
        }
      });
      localStorage.setItem('sanket_version_tracker', CURRENT_STORAGE_VERSION);
    }
  } catch (e) {
    console.warn('[SANKET Storage] Storage version check skipped', e);
  }
}

ensureCurrentVersion();

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    ensureCurrentVersion();
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[SANKET Storage] Failed to parse key ${key}, falling back to defaults`, err);
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`[SANKET Storage] Failed to save key ${key}`, err);
  }
}

export function clearSanketStorage(): void {
  try {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('sanket_')) {
        localStorage.removeItem(k);
      }
    });
    localStorage.setItem('sanket_version_tracker', CURRENT_STORAGE_VERSION);
  } catch (err) {
    console.error('[SANKET Storage] Failed to clear storage', err);
  }
}
