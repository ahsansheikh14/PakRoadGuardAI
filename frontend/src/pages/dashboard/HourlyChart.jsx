import Card from '../../components/Card'

// Bar chart of violations per hour. Busy hours (10 or more) are amber.
const BUSY = 10

export default function HourlyChart({ firstHour, counts }) {
  const max = Math.max(...counts)
  const lastHour = firstHour + counts.length - 1
  const middleHour = firstHour + Math.floor((counts.length - 1) / 2)

  return (
    <Card className="px-5 pt-[17px] pb-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] leading-6 font-semibold">Violations by hour</h2>
        <span className="text-[13px] text-slate-500">Today</span>
      </div>

      <div className="mt-[22px] flex h-[200px] items-end gap-1.5">
        {counts.map((count, i) => (
          <div
            key={i}
            title={`${hourLabel(firstHour + i)}: ${count}`}
            className={`flex-1 rounded-t-[3px] ${count >= BUSY ? 'bg-amber' : 'bg-navy'}`}
            style={{ height: `${(count / max) * 100}%` }}
          />
        ))}
      </div>

      <div className="mt-[14px] flex justify-between text-[12px] leading-4 text-slate-500">
        <span>{hourLabel(firstHour)}</span>
        <span>{hourLabel(middleHour)}</span>
        <span>{hourLabel(lastHour)}</span>
      </div>
    </Card>
  )
}

// 7 -> "7 am", 12 -> "12 pm", 18 -> "6 pm"
function hourLabel(hour) {
  const suffix = hour < 12 ? 'am' : 'pm'
  return `${hour % 12 || 12} ${suffix}`
}
