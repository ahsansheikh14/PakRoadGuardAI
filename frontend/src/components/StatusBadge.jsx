// Small coloured pill: Pending (amber), Approved (blue), Rejected (grey).
const styles = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-navy',
  rejected: 'bg-slate-100 text-slate-700',
}

const labels = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }

export default function StatusBadge({ status, label }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-[3px] text-[12px] leading-4 font-semibold ${styles[status]}`}
    >
      {label ?? labels[status]}
    </span>
  )
}
