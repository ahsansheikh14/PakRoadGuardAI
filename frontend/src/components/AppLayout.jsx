import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

// Every page after sign-in: sidebar on the left, the page on the right.
export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1 px-8 pt-8 pb-12">
        <Outlet />
      </main>
    </div>
  )
}
