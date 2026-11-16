// Amber square with a shield icon, followed by the product name.
// `size="large"` is the version on the Sign in page (bigger, shield with a tick).
export default function Logo({ size = 'small' }) {
  const large = size === 'large'
  return (
    <div className={`flex items-center ${large ? 'gap-3' : 'gap-2.5'}`}>
      <span
        className={`flex items-center justify-center bg-amber ${
          large ? 'size-10 rounded-[10px]' : 'size-8 rounded-lg'
        }`}
      >
        <ShieldIcon withTick={large} className={large ? 'size-5' : 'size-[17px]'} />
      </span>
      <span
        className={`font-display font-semibold text-white ${
          large ? 'text-[20px] tracking-[-0.01em]' : 'text-[17px] tracking-[-0.01em]'
        }`}
      >
        PakRoadGuardAI
      </span>
    </div>
  )
}

function ShieldIcon({ withTick, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0f1a2c"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      {withTick && <path d="m9 12 2 2 4-4" />}
    </svg>
  )
}
