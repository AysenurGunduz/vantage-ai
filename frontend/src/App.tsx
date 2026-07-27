import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Workspace from "./pages/Workspace";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import InviteAccept from "./pages/InviteAccept";
import TeamMembers from "./pages/TeamMembers";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { GuestRoute } from "./components/auth/GuestRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/workspace"
        element={
          <ProtectedRoute>
            <Workspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/organizations/:orgId/team"
        element={
          <ProtectedRoute>
            <TeamMembers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invite/:token"
        element={
          <ProtectedRoute>
            <InviteAccept />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <Signup />
          </GuestRoute>
        }
      />
    </Routes>
  );
}

export default App;
