import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { SignIn } from "./pages/auth";

function App() {
  return (
    <Routes>
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/auth/*" element={<SignIn />} />
      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
    </Routes>
  );
}

export default App;
