import { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AuthPage } from "./pages/AuthPage";
import { AlertsPage } from "./pages/AlertsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EventsPage } from "./pages/EventsPage";
import { UsersPage } from "./pages/UsersPage";
import { useAuth } from "./state/AuthContext";

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading PulseWatch...</div>;
  }

  return token ? children : <Navigate to="/auth" replace />;
};

const AdminRoute = ({ children }: { children: ReactElement }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading PulseWatch...</div>;
  }

  return user?.role === "admin" ? children : <Navigate to="/dashboard" replace />;
};

const PublicRoute = ({ children }: { children: ReactElement }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading PulseWatch...</div>;
  }

  return token ? <Navigate to="/" replace /> : children;
};

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <AppShell>
            <DashboardPage />
          </AppShell>
        </ProtectedRoute>
      }
    />
    <Route
      path="/events"
      element={
        <ProtectedRoute>
          <AppShell>
            <EventsPage />
          </AppShell>
        </ProtectedRoute>
      }
    />
    <Route
      path="/analytics"
      element={
        <ProtectedRoute>
          <AppShell>
            <AnalyticsPage />
          </AppShell>
        </ProtectedRoute>
      }
    />
    <Route
      path="/alerts"
      element={
        <ProtectedRoute>
          <AppShell>
            <AlertsPage />
          </AppShell>
        </ProtectedRoute>
      }
    />
    <Route
      path="/users"
      element={
        <ProtectedRoute>
          <AdminRoute>
            <AppShell>
              <UsersPage />
            </AppShell>
          </AdminRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/auth"
      element={
        <PublicRoute>
          <AuthPage />
        </PublicRoute>
      }
    />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default App;
