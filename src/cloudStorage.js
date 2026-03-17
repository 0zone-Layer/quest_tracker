const SECRET = import.meta.env.VITE_SAVE_SECRET || "";

const cache = new Map();
const timers = {};
const cacheTime = new Map();

const TTL = 2000; // 2 seconds

// ✅ GET DATA
export async function cloudGet(key, forceFresh = false) {
  const now = Date.now();

  // use cache only if fresh
  if (!forceFresh && cache.has(key)) {
    const age = now - (cacheTime.get(key) || 0);
    if (age < TTL) return cache.get(key);
  }

  try {
    const res = await fetch(
      `/api/load?key=${encodeURIComponent(key)}&secret=${SECRET}`
    );

    if (!res.ok) return null;

    const data = await res.json();

    cache.set(key, data.value);
    cacheTime.set(key, now);

    return data.value;
  } catch {
    return null;
  }
}

// ✅ SET DATA
export function cloudSet(key, value) {
  cache.set(key, value);
  cacheTime.set(key, Date.now());

  clearTimeout(timers[key]);

  timers[key] = setTimeout(async () => {
    try {
      await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: SECRET,
          key,
          value,
        }),
      });
    } catch {}
  }, 300);

  // 🔥 notify other components
  window.dispatchEvent(new CustomEvent("cloud:update", { detail: key }));
}
