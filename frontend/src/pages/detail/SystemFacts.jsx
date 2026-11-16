import Card from '../../components/Card'

// "What the system saw": a two-column list of label + value.
export default function SystemFacts({ violation }) {
  const facts = [
    ['Vehicle', `${violation.vehicleName} · track #${violation.track}`],
    violation.fact,
    ['Average confidence', violation.confidence.toFixed(2)],
    ['Rule', violation.typeInfo.rule],
    ['Models', violation.models],
    ['Also flagged', violation.alsoFlagged],
  ]

  return (
    <Card className="px-4 pt-4 pb-[17px]">
      <h2 className="text-[16px] leading-6 font-semibold">What the system saw</h2>
      <dl className="mt-1.5 grid grid-cols-[160px_1fr] gap-y-[13px]">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[13px] leading-4 text-slate-600">{label}</dt>
            <dd className="mt-0.5 pr-1 text-[14px] leading-4 font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
