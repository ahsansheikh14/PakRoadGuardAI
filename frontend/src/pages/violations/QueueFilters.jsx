import Select from '../../components/Select'

const typeTabs = [
  ['all', 'All'],
  ['no-helmet', 'No helmet'],
  ['wrong-way', 'Wrong-way'],
  ['triple-riding', 'Triple riding'],
]

// Type pills on the left; search, status and date on the right.
// `filters` is one object; `onChange` receives the updated object.
export default function QueueFilters({ filters, onChange }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="mt-[18px] flex items-center justify-between">
      <div className="flex gap-2">
        {typeTabs.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => set('type', value)}
            className={`h-10 rounded-full px-[14px] text-[14px] ${
              filters.type === value
                ? 'bg-navy font-semibold text-white'
                : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="search"
          aria-label="Search by violation or track ID"
          placeholder="Search ID or track..."
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          className="h-11 w-[220px] rounded-lg border border-line bg-white px-[13px] text-[15px] placeholder:text-slate-500 focus:border-navy focus:outline-none"
        />
        <Select
          aria-label="Status"
          value={filters.status}
          onChange={(e) => set('status', e.target.value)}
          className="w-[120px]"
        >
          <option value="all">Any status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
        <input
          type="date"
          aria-label="Date"
          value={filters.date}
          onChange={(e) => set('date', e.target.value)}
          className="h-11 w-[151px] rounded-lg border border-line bg-white px-3 text-[15px] focus:border-navy focus:outline-none"
        />
      </div>
    </div>
  )
}
