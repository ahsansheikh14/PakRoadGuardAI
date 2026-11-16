import { Navigate } from 'react-router-dom'
import { useRole } from './RoleContext'

// Sends visitors who have not signed in to the Sign in page.
// With `only="admin"` it also blocks other roles.
export default function RequireRole({ only, children }) {
  const { role } = useRole()
  if (!role) return <Navigate to="/sign-in" replace />
  if (only && role.id !== only) return <Navigate to="/dashboard" replace />
  return children
}
