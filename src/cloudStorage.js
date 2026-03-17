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

  console.log("cloudGet called:", key, forceFresh ? "(force fresh)" : "(cached)");
  try {
    const res = await fetch(
      `/api/load?key=${encodeURIComponent(key)}&secret=${SECRET}`
    );
    console.log("Load API response status:", res.status);
    if (!res.ok) {
      console.error("Load API error");
      return null;
    }

    const data = await res.json();
    console.log("Loaded data:", data);

    cache.set(key, data.value);
    cacheTime.set(key, now);

    return data.value;
  } catch (error) {
    console.error("Load fetch error:", error);
    return null;
  }
}

// ✅ SET DATA
export function cloudSet(key, value) {
  console.log("cloudSet called:", key, value);
  cache.set(key, value);
  cacheTime.set(key, Date.now());

  clearTimeout(timers[key]);

  timers[key] = setTimeout(async () => {
    console.log("Attempting to save to API:", key);
    try {
      const response = await fetch("/api/save", {
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
      console.log("API response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", errorText);
      } else {
        console.log("Successfully saved:", key);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, 300);

  // 🔥 notify other components
  window.dispatchEvent(new CustomEvent("cloud:update", { detail: key }));
}
