// Right-hand form: thresholds for the rules and which detections run on this camera.
const numberFields = [
  ['framesBeforeAlert', 'Frames before alerting', 'Rule must hold in this many of the last 8 frames', 1, 8, 1],
  ['toleranceDegrees', 'Direction tolerance (degrees)', 'Movement more than this far from the arrow counts as wrong-way', 0, 180, 5],
  ['minConfidence', 'Minimum detection confidence', null, 0.1, 0.95, 0.05],
]

const detections = [
  ['wrongWay', 'Wrong-way driving'],
  ['noHelmet', 'No helmet'],
  ['tripleRiding', 'Triple riding'],
  ['vehicleCounting', 'Vehicle counting'],
]

export default function RuleSettings({ settings, onChange, onSave }) {
  function set(key, value) {
    onChange({ ...settings, [key]: value })
  }

  return (
    <div className="w-[280px] shrink-0">
      <h2 className="text-[16px] leading-6 font-semibold">Rule settings</h2>

      {numberFields.map(([key, label, help, min, max, step], i) => (
        <div key={key} className={i === 0 ? 'mt-[7px]' : 'mt-[13px]'}>
          <label htmlFor={key} className="block text-[14px] leading-5 font-medium">
            {label}
          </label>
          <input
            id={key}
            type="number"
            min={min}
            max={max}
            step={step}
            value={settings[key]}
            onChange={(e) => set(key, Number(e.target.value))}
            className="mt-1.5 block h-[42px] w-full rounded-lg border border-line px-[13px] text-[15px] focus:border-navy focus:outline-none"
          />
          {help && <p className="mt-1.5 text-[12px] leading-[14.5px] text-slate-500">{help}</p>}
        </div>
      ))}

      <p className="mt-[13px] text-[14px] leading-5 font-medium">Detections on this camera</p>
      <ul className="mt-3 space-y-5">
        {detections.map(([key, label]) => (
          <li key={key}>
            <label className="flex items-center gap-[11px] pl-1 text-[14px] leading-5">
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={(e) => set(key, e.target.checked)}
                className="size-[13px] accent-blue-600"
              />
              {label}
            </label>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSave}
        className="mt-5 h-12 w-full rounded-lg bg-navy text-[15px] font-semibold text-white hover:bg-navy-dark"
      >
        Save and send to device
      </button>
      <p className="mt-[14px] text-[12px] leading-[14.5px] text-slate-500">
        The device picks up new settings at its next heartbeat. If it is offline, they wait until it
        reconnects.
      </p>
    </div>
  )
}
