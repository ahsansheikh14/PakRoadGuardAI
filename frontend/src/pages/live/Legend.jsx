// Explains the box colours under the camera picture.
const items = [
  ['Vehicle', 'border-blue-400'],
  ['Violation / no helmet', 'border-orange-500'],
  ['Helmet', 'border-emerald-400'],
  ['Direction zone', 'border-dashed border-amber'],
]

export default function Legend() {
  return (
    <ul className="mt-[11px] flex gap-4 text-[13px] leading-5 text-slate-600">
      {items.map(([label, border]) => (
        <li key={label} className="flex items-center gap-[5px]">
          <span className={`size-[13px] border-2 ${border}`} />
          {label}
        </li>
      ))}
    </ul>
  )
}
