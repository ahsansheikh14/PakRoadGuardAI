// Page title, one line of description, and optional controls on the right.
export default function PageHeader({ title, children, actions }) {
  return (
    <header className="flex items-start justify-between gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-9 font-semibold tracking-[-0.01em]">
          {title}
        </h1>
        {children && <p className="mt-0.5 text-[14px] text-slate-600">{children}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
