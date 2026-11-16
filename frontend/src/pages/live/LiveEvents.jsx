import Card from '../../components/Card'
import SampleTag from '../../components/SampleTag'

// Right-hand list of what just happened. Violations are highlighted in orange.
export default function LiveEvents({ events }) {
  return (
    <Card className="self-start px-[18px] pt-[17px] pb-[18px]">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] leading-6 font-semibold">Live events</h2>
        <SampleTag className="text-[12px]" />
      </div>

      <ul className="mt-[11px] space-y-3">
        {events.map((event) => (
          <li
            key={event.title}
            className={`rounded-[10px] border px-[13px] py-2.5 ${
              event.alert ? 'border-[#f6dcbc] bg-orange-50' : 'border-line'
            }`}
          >
            <p
              className={`text-[15px] leading-5 font-semibold ${event.alert ? 'text-orange-800' : ''}`}
            >
              {event.title}
            </p>
            <p className="mt-px text-[13px] leading-[18px] text-slate-600">{event.detail}</p>
          </li>
        ))}
      </ul>

      <p className="mt-[18px] text-[13px] leading-5 text-slate-500">
        An alert fires only when a rule holds across several frames of the same tracked vehicle, so
        one bad frame cannot create a violation.
      </p>
    </Card>
  )
}
