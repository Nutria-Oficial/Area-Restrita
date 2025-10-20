import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Organograma from "./pages/Organograma";
import Chat from "./pages/Chat";
import Sidebar from "./components/Sidebar";

function App() {
  const isLoggedIn = !!localStorage.getItem("user");

  if (!isLoggedIn) return <Login />;

  return (
    <BrowserRouter>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/organograma" element={<Organograma />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
