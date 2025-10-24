import { useEffect } from "react";
import {
  Navigate,
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAppDispatch } from "./hooks/hook";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmail from "./pages/VerifyEmail";
import WorkspacePage from "./pages/WorkspacePage";
import WorkspaceDetailsPage from "./pages/WorkspaceDetailsPage";
import WorkspaceInvitePage from "./pages/WorkspaceInvitePage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import { fetchMe } from "./store/auth/auth-slice";
import ProtectedRoute from "./components/auth/ProtectedRoutes";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route
            path="/workspace/:workspaceId"
            element={<WorkspaceDetailsPage />}
          />
          <Route
            path="/workspace-invite/:workspaceId"
            element={<WorkspaceInvitePage />}
          />
          <Route
            path="/workspace/:workspaceId/project/:projectId"
            element={<ProjectDetailsPage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
