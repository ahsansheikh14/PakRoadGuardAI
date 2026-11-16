// White box with a thin border and rounded corners, used on every page.
export default function Card({ className = '', children }) {
  return (
    <section className={`rounded-xl border border-line bg-white ${className}`}>{children}</section>
  )
}
