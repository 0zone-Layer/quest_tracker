const SECRET = import.meta.env.VITE_SAVE_SECRET || "";
const cache  = new Map();

export async function cloudGet(key) {
  if (cache.has(key)) return cache.get(key);
  try {
    const res  = await fetch(`/api/load?key=${encodeURIComponent(key)}&secret=${SECRET}`);
    if (!res.ok) return null;
    const data = await res.json();
    cache.set(key, data.value);
    return data.value;
  } catch {
    return null;
  }
}

const timers = {};
export function cloudSet(key, value) {
  cache.set(key, value);
  clearTimeout(timers[key]);
  timers[key] = setTimeout(async () => {
    try {
      await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: SECRET, key, value }),
      });
    } catch {}
  }, 500);
}