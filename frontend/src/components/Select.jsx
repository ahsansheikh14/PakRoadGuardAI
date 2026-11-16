// A normal <select> styled like the design (white box, thin border, native arrow).
export default function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`h-11 rounded-lg border border-line bg-white px-3 text-[15px] focus:border-navy focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
