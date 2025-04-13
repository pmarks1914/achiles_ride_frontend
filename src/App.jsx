import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { SignIn } from "./pages/auth";
import ChatContainer from "./pages/ride/ChatContainer";
import { Suspense } from "react";


const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)
const currentUser = JSON.parse(localStorage.getItem("userDataStore"));

function App() {

  return (

    <Suspense fallback={loading}>
      <Routes>
        <Route path="/Chat/*" element={<ChatContainer />} />
        {/* ChatContainer */}
        <Route path="/auth/*" element={<SignIn />} />
        {/* <Route path="*" element={<Navigate to="/dashboard/home" replace />} /> */}

        {/* Protected routes  */}
        {
          currentUser?.access ?
            [
              <Route path="/dashboard/*" element={<Dashboard />} key={1} />
            ]
            : ""
        }
      </Routes>
    </Suspense>
  );
}

export default App;
