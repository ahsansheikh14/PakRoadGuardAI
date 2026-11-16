// Grey bar of camera buttons at the top right of Live monitoring.
export default function CameraTabs({ cameras, selected, onSelect }) {
  return (
    <div className="flex gap-1.5 rounded-xl bg-[#e8ebf2] p-[5px]">
      {cameras.map((camera) => (
        <button
          key={camera.id}
          type="button"
          onClick={() => onSelect(camera.id)}
          className={`h-[38px] rounded-lg px-[13.5px] text-[14px] ${
            camera.id === selected
              ? 'bg-white font-semibold text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {camera.id}
          {!camera.online && ' · offline'}
        </button>
      ))}
    </div>
  )
}
