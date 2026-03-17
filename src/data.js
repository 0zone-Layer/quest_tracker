// src/data.js
export const PHASES = [
  { id:"p1", year:1, num:1, icon:"⚙️", title:"C Programming + Linux Foundations", period:"Mar–May 2026", color:"#00ff88", quests:10 },
  // ... paste ALL 12 phases exactly as they are in PublicProfile.jsx
];

export const QUEST_MAP = {
  p1q1: { title: "K.N. King Ch.1–8: C basics", xp: 100, phase: "p1" },
  // ... paste the ENTIRE QUEST_MAP object exactly as it is in PublicProfile.jsx
};

// Helper functions (used by both components)
export const getTotalXP = () => Object.values(QUEST_MAP).reduce((sum, q) => sum + q.xp, 0);
export const calculateProgress = (completed = {}) => {
  const totalQuests = Object.keys(QUEST_MAP).length;
  const completedCount = Object.keys(completed).length;
  const totalXP = getTotalXP();
  const earnedXP = Object.keys(completed).reduce((sum, id) => sum + (QUEST_MAP[id]?.xp || 0), 0);
  return { totalQuests, completedCount, progressPercent: Math.round((completedCount / totalQuests) * 100), earnedXP, totalXP };
};
