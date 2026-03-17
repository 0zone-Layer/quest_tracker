import { useState, useEffect, useMemo, useCallback } from "react";
import { cloudGet } from "./cloudStorage";
import { PHASES, QUEST_MAP, calculateProgress } from "./data";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || "";
const TELEGRAM_ENDPOINT = "/api/telegram";   // ← confirmed from your repo

export default function PublicProfile() {
  const [profile, setProfile] = useState(null);
  const [completed, setCompleted] = useState({});
  const [geminiSummary, setGeminiSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live sync from QuestTracker (no loops)
  const loadProgress = useCallback(async () => {
    try {
      const data = await cloudGet();
      setCompleted(data?.completed || {});
    } catch (err) {
      console.error("Cloud sync error:", err);
    }
  }, []);

  // Telegram profile
  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch(TELEGRAM_ENDPOINT);
      if (!res.ok) throw new Error("Telegram API failed");
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("Telegram fetch error:", err);
      setProfile({ name: "KNKing", username: null, bio: null, photoUrl: null });
    }
  }, []);

  // Gemini AI summary (safe fallback)
  const generateSummary = useCallback(async () => {
    if (!GEMINI_KEY || Object.keys(completed).length === 0) return;
    try {
      const prompt = `You are a hype mentor. Write a 3-sentence motivational summary for a developer who completed these quests: ${Object.keys(completed).join(", ")}. Keep it under 80 words, very energetic.`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const json = await res.json();
      setGeminiSummary(json.candidates?.[0]?.content?.parts?.[0]?.text || "Legendary grind in progress 🔥");
    } catch (err) {
      setGeminiSummary("Keep crushing it — the world is watching! 🔥");
    }
  }, [completed]);

  useEffect(() => {
    Promise.all([loadProfile(), loadProgress()]).then(() => setLoading(false));
  }, [loadProfile, loadProgress]);

  useEffect(() => {
    if (!loading) generateSummary();
  }, [loading, generateSummary]);

  const stats = useMemo(() => calculateProgress(completed), [completed]);

  if (error) return <div className="text-red-500 p-8 text-center">Error: {error}<br />Check Vercel env vars</div>;
  if (loading) return <div className="flex items-center justify-center h-screen text-2xl">Loading your legend... 🔥</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Hero + Telegram profile */}
      {profile?.photoUrl && <img src={profile.photoUrl} className="w-32 h-32 rounded-full mx-auto mb-4" />}
      <h1 className="text-5xl font-bold text-center">{profile?.name || "KNKing"}</h1>
      <p className="text-center text-xl mt-2">{profile?.bio || "Future systems god in training"}</p>

      {/* Progress Overview */}
      <div className="mt-12 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-green-400">{stats.progressPercent}%</div>
          <div className="text-xl">OVERALL PROGRESS • {stats.completedCount}/{stats.totalQuests} quests • {stats.earnedXP} XP</div>
        </div>

        {PHASES.map(phase => {
          const phaseQuests = Object.keys(QUEST_MAP).filter(id => QUEST_MAP[id].phase === phase.id);
          const doneInPhase = phaseQuests.filter(id => completed[id]).length;
          return (
            <div key={phase.id} className="mb-8 bg-zinc-900 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{phase.icon}</span>
                  <div>
                    <div className="font-bold text-xl">{phase.title}</div>
                    <div className="text-sm text-zinc-400">{phase.period}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-400">{Math.round((doneInPhase / phaseQuests.length) * 100)}%</div>
                </div>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: `${(doneInPhase / phaseQuests.length) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Gemini AI Hype */}
      {geminiSummary && (
        <div className="max-w-2xl mx-auto mt-12 p-8 bg-zinc-900 rounded-2xl border border-green-500/30">
          <div className="text-green-400 text-sm mb-2">✦ AI MENTOR SAYS ✦</div>
          <p className="text-xl leading-relaxed">{geminiSummary}</p>
        </div>
      )}
    </div>
  );
}
