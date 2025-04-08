import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { SignIn } from "./pages/auth";
import ChatContainer from "./pages/ride/ChatContainer";

function App() {
  return (
    <Routes>
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/Chat/*" element={<ChatContainer />} />
      {/* ChatContainer */}
      <Route path="/auth/*" element={<SignIn />} />
      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
    </Routes>
  );
}

export default App;
