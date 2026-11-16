import { NavLink } from 'react-router-dom'
import { getSummary } from '../api'
import { useRole } from '../auth/RoleContext'
import { useApi } from '../hooks/useApi'
import Logo from './Logo'

// Menu items. `adminOnly` items are hidden from other roles.
const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/live', label: 'Live monitoring' },
  { to: '/violations', label: 'Violations', badge: 'pendingReviews' },
  { to: '/cameras', label: 'Cameras & zones', adminOnly: true },
  { to: '/reports', label: 'Reports' },
  { to: '/users', label: 'Users & roles' },
]

export default function Sidebar() {
  const { role } = useRole()
  const { data: summary } = useApi(getSummary)
  const visible = links.filter((link) => !link.adminOnly || role.id === 'admin')

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-sidebar px-4 pt-6 pb-6">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="mt-7 flex flex-col gap-1">
        {visible.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex h-11 items-center justify-between rounded-lg px-3 text-[14px] ${
                isActive
                  ? 'bg-sidebar-active font-semibold text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {link.label}
            {link.badge && summary && (
              <span className="rounded-full bg-amber px-2 py-[1.5px] text-[12px] leading-4 font-semibold text-sidebar">
                {summary[link.badge]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-sidebar-line px-3 pt-3.5 text-[13px] leading-4">
        <span className="text-slate-400">Signed in as </span>
        <span className="text-white">{role.label}</span>
      </div>
    </aside>
  )
}
