const SECRET = import.meta.env.VITE_SAVE_SECRET || "";

// Local cache to reduce API calls
const cache = new Map();
const timers = {};
const cacheTime = new Map();
const TTL = 3000; // 3 seconds

/**
 * Get user profile data from backend
 * @param {string} username - Username to load profile for
 * @returns {Promise<Object|null>} Profile object with quest and focus data, or null if not found
 */
export async function getProfile(username) {
  const now = Date.now();

  // Check if cache is fresh
  if (cache.has(username)) {
    const age = now - (cacheTime.get(username) || 0);
    if (age < TTL) {
      console.log("getProfile: Using cached data for", username);
      return cache.get(username);
    }
  }

  console.log("getProfile: Fetching fresh data for", username);
  try {
    const res = await fetch("/api/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Username": username,
        "X-Secret": SECRET,
      },
    });

    console.log("getProfile: API response status:", res.status);

    if (!res.ok) {
      console.error("getProfile: API error status", res.status);
      return null;
    }

    const data = await res.json();
    console.log("getProfile: Received data:", data);

    // Cache the profile object (not stringified)
    cache.set(username, data);
    cacheTime.set(username, now);

    return data;
  } catch (error) {
    console.error("getProfile: Fetch error:", error);
    return null;
  }
}

/**
 * Save user profile data to backend
 * @param {string} username - Username to save profile for
 * @param {Object} data - Profile object with completed quests and focus data
 * @returns {Promise<boolean>} True if save succeeded, false otherwise
 */
export function saveProfile(username, data) {
  console.log("saveProfile: Called for", username, "with data:", data);

  // Update cache immediately
  cache.set(username, data);
  cacheTime.set(username, Date.now());

  // Clear existing timer
  clearTimeout(timers[username]);

  // Debounce saves (300ms delay)
  timers[username] = setTimeout(async () => {
    console.log("saveProfile: Sending to API for", username);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Username": username,
          "X-Secret": SECRET,
        },
        body: JSON.stringify(data), // Send object directly, not stringified
      });

      console.log("saveProfile: API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("saveProfile: API error response:", errorText);
        return false;
      }

      console.log("saveProfile: Successfully saved for", username);
      return true;
    } catch (error) {
      console.error("saveProfile: Fetch error:", error);
      return false;
    }
  }, 300);

  // Notify other components
  window.dispatchEvent(
    new CustomEvent("profile:update", { detail: { username } })
  );
}

/**
 * Clear cache (useful for logout/user switch)
 */
export function clearCache() {
  console.log("clearCache: Clearing all profile data");
  cache.clear();
  cacheTime.clear();
  Object.keys(timers).forEach((key) => clearTimeout(timers[key]));
  timers = {};
}
