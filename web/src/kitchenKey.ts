// The kitchen key is typed once on the kitchen device and kept there. It is a
// shared secret for the kitchen screen, not a user login.
const KITCHEN_KEY = 'orderup:kitchenKey';

export function getKitchenKey() {
  try {
    return localStorage.getItem(KITCHEN_KEY);
  } catch {
    return null;
  }
}

export function setKitchenKey(key: string | null) {
  try {
    if (key) localStorage.setItem(KITCHEN_KEY, key);
    else localStorage.removeItem(KITCHEN_KEY);
  } catch {
    // storage unavailable: the key is asked again on reload
  }
}
