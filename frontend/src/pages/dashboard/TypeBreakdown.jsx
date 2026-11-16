import Card from '../../components/Card'

const typeNames = [
  ['no-helmet', 'No helmet'],
  ['wrong-way', 'Wrong-way driving'],
  ['triple-riding', 'Triple riding'],
]

// Right-hand card: one bar per violation type, then the vehicle mix chips.
export default function TypeBreakdown({ byType, total, vehicleMix }) {
  return (
    <Card className="px-5 pt-[17px] pb-5">
      <h2 className="text-[17px] leading-6 font-semibold">By violation type</h2>
      <ul className="mt-3 space-y-3">
        {typeNames.map(([type, name]) => (
          <li key={type}>
            <div className="flex justify-between text-[14px] leading-5">
              <span>{name}</span>
              <span className="font-semibold">{byType[type]}</span>
            </div>
            <div className="mt-[5px] h-2.5 rounded-full bg-track">
              <div
                className="h-full rounded-full bg-navy"
                style={{ width: `${(byType[type] / total) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-[22px] text-[17px] leading-6 font-semibold">Vehicle mix</h2>
      <ul className="mt-[14px] flex flex-wrap gap-2">
        {vehicleMix.map((item) => (
          <li key={item.label} className="rounded-full bg-track px-2.5 py-1 text-[13px] leading-[19px]">
            {item.label} {item.percent}%
          </li>
        ))}
      </ul>
    </Card>
  )
}
