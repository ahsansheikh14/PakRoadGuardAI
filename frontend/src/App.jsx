import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RoleProvider } from './auth/RoleContext'
import RequireRole from './auth/RequireRole'
import AppLayout from './components/AppLayout'
import Cameras from './pages/Cameras'
import Dashboard from './pages/Dashboard'
import LiveMonitoring from './pages/LiveMonitoring'
import Placeholder from './pages/Placeholder'
import ViolationDetail from './pages/ViolationDetail'
import Violations from './pages/Violations'
import SignIn from './pages/SignIn'

export default function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />

          <Route
            element={
              <RequireRole>
                <AppLayout />
              </RequireRole>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="live" element={<LiveMonitoring />} />
            <Route path="violations" element={<Violations />} />
            <Route path="violations/:id" element={<ViolationDetail />} />
            <Route
              path="cameras"
              element={
                <RequireRole only="admin">
                  <Cameras />
                </RequireRole>
              }
            />
            <Route
              path="reports"
              element={
                <Placeholder
                  title="Reports"
                  description="Daily and monthly summaries of violations per camera"
                  comingLater="Downloadable PDF and CSV reports of approved violations, vehicle counts and camera uptime will appear here."
                />
              }
            />
            <Route
              path="users"
              element={
                <Placeholder
                  title="Users & roles"
                  description="Officer and administrator accounts"
                  comingLater="Administrators will add officers, reset passwords and unlock accounts here. Every change is written to the audit log."
                />
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  )
}
