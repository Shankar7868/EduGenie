import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";

import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/chat/:mode"
            element={<ChatPage />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;