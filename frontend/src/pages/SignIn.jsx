import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRoles } from '../api'
import { useRole } from '../auth/RoleContext'
import { useApi } from '../hooks/useApi'
import Logo from '../components/Logo'

const highlights = ['Offline edge AI', 'Faces & plates blurred', 'Human review before action']

export default function SignIn() {
  return (
    <div className="flex min-h-screen">
      <IntroPanel />
      <div className="flex w-1/2 items-center justify-center bg-page">
        <SignInForm />
      </div>
    </div>
  )
}

// Left half: what the system does.
function IntroPanel() {
  return (
    <div className="flex w-1/2 flex-col bg-sidebar px-16 pt-16 pb-16">
      <Logo size="large" />

      <div className="flex flex-1 flex-col justify-center">
        <h1 className="max-w-[500px] font-display text-[45px] leading-[48px] font-semibold tracking-[-0.01em] text-white">
          Road safety analytics that run on the roadside, not in the cloud.
        </h1>
        <p className="mt-6 max-w-[540px] text-[17px] leading-[27px] text-[#b6c3d6]">
          Edge cameras detect wrong-way driving, riders without helmets and triple riding.
          Officers review the evidence here before any action is taken.
        </p>
        <ul className="mt-7 flex gap-2">
          {highlights.map((text) => (
            <li
              key={text}
              className="rounded-full border border-[#2f3b51] px-3 py-1 text-[13px] leading-[19px] text-slate-300"
            >
              {text}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[13px] text-slate-400">
        Bahria University Islamabad · BSSE Final Year Project
      </p>
    </div>
  )
}

// Right half: the form. There is no real login yet, so "Sign in" only stores the chosen role.
function SignInForm() {
  const { data: roles } = useApi(getRoles)
  const { signIn } = useRole()
  const navigate = useNavigate()
  const [roleId, setRoleId] = useState('officer')

  function handleSubmit(event) {
    event.preventDefault()
    signIn(roleId)
    navigate('/dashboard')
  }

  const inputClass =
    'h-[46px] w-full rounded-lg border border-slate-300 bg-white px-3.5 text-[16px] placeholder:text-slate-500 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20'

  return (
    <form onSubmit={handleSubmit} className="w-[400px]">
      <h2 className="font-display text-[28px] leading-9 font-semibold tracking-[-0.01em]">Sign in</h2>
      <p className="mt-1 text-[15px] text-slate-600">
        Use the account your administrator created for you.
      </p>

      <label className="mt-[18px] mb-1 block text-[14px] leading-5 font-medium" htmlFor="email">
        Email
      </label>
      <input id="email" type="email" placeholder="officer@agency.gov.pk" className={inputClass} />

      <div className="mt-[18px] mb-1 flex items-baseline justify-between">
        <label className="text-[14px] leading-5 font-medium" htmlFor="password">
          Password
        </label>
        <a href="#" className="text-[13px] text-link underline">
          Forgot password?
        </a>
      </div>
      <input id="password" type="password" placeholder="••••••••" className={inputClass} />

      <label className="mt-[18px] mb-1 block text-[14px] leading-5 font-medium" htmlFor="role">
        Sign in as
      </label>
      <select
        id="role"
        value={roleId}
        onChange={(event) => setRoleId(event.target.value)}
        className={`${inputClass} px-3`}
      >
        {roles?.map((role) => (
          <option key={role.id} value={role.id}>
            {role.label}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="mt-5 h-[46px] w-full rounded-lg bg-navy text-[16px] font-semibold text-white hover:bg-navy-dark"
      >
        Sign in
      </button>

      <p className="mt-5 text-[13px] leading-5 text-slate-500">
        After 3 failed attempts the account is locked for 1 hour. All actions are logged for audit.
      </p>
    </form>
  )
}
