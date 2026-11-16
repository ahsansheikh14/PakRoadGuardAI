// Short bar plus the number, e.g. [=====   ] 0.88
export default function ConfidenceBar({ value }) {
  return (
    <div className="flex items-center gap-[9px] text-[15px]">
      <div className="h-1.5 w-[60px] rounded-full bg-track">
        <div className="h-full rounded-full bg-navy" style={{ width: `${value * 100}%` }} />
      </div>
      {value.toFixed(2)}
    </div>
  )
}
