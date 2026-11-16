import { createContext, useContext, useState } from 'react'
import { roles } from '../data/roles'

// No real login yet: we only remember which role was picked on the Sign in page.
const STORAGE_KEY = 'pakroadguard.role'
const RoleContext = createContext(null)

export function RoleProvider({ children }) {
  const [roleId, setRoleId] = useState(() => localStorage.getItem(STORAGE_KEY))

  function signIn(id) {
    localStorage.setItem(STORAGE_KEY, id)
    setRoleId(id)
  }

  function signOut() {
    localStorage.removeItem(STORAGE_KEY)
    setRoleId(null)
  }

  const role = roles.find((r) => r.id === roleId) ?? null
  return (
    <RoleContext.Provider value={{ role, signIn, signOut }}>{children}</RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
