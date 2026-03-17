import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuestTracker from "./QuestTracker";
import PublicProfile from "./PublicProfile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public page first */}
        <Route path="/" element={<PublicProfile />} />

        {/* Tracker (private) */}
        <Route path="/profile" element={<QuestTracker />} />
      </Routes>
    </BrowserRouter>
  );
}