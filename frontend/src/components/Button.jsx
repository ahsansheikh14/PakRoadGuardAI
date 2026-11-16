// Buttons used across pages.
// variant: 'primary' (navy), 'outline' (navy border), 'plain' (grey border)
const variants = {
  primary: 'bg-navy text-white hover:bg-navy-dark',
  outline: 'border border-navy bg-white text-navy hover:bg-blue-50',
  plain: 'border border-line bg-white text-slate-900 hover:bg-slate-50',
}

export default function Button({ variant = 'plain', className = '', ...props }) {
  return (
    <button
      type="button"
      className={`rounded-lg text-[14px] font-medium disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
