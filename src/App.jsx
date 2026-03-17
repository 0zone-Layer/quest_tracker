import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuestTracker from "./QuestTracker";
import PublicProfile from "./PublicProfile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuestTracker />} />
        <Route path="/profile" element={<PublicProfile />} />
      </Routes>
    </BrowserRouter>
  );
}
