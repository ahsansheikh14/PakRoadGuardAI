import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RoleProvider } from './auth/RoleContext'
import RequireRole from './auth/RequireRole'
import AppLayout from './components/AppLayout'
import Placeholder from './pages/Placeholder'
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
            <Route path="dashboard" element={<Placeholder title="Dashboard" />} />
            <Route path="live" element={<Placeholder title="Live monitoring" />} />
            <Route path="violations" element={<Placeholder title="Violations review queue" />} />
            <Route path="violations/:id" element={<Placeholder title="Violation" />} />
            <Route
              path="cameras"
              element={
                <RequireRole only="admin">
                  <Placeholder title="Cameras & zones" />
                </RequireRole>
              }
            />
            <Route
              path="reports"
              element={
                <Placeholder
                  title="Reports"
                  description="Daily and monthly summaries of violations per camera · sample data"
                  comingLater="Downloadable PDF and CSV reports of approved violations, vehicle counts and camera uptime will appear here."
                />
              }
            />
            <Route
              path="users"
              element={
                <Placeholder
                  title="Users & roles"
                  description="Officer and administrator accounts · sample data"
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
