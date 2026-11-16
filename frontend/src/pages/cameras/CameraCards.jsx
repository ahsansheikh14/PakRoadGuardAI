// One card per edge device with its health. Clicking a card opens its zones below.
export default function CameraCards({ cameras, selected, onSelect }) {
  return (
    <div className="mt-[17px] grid grid-cols-4 gap-4">
      {cameras.map((camera) => (
        <button
          key={camera.id}
          type="button"
          onClick={() => onSelect(camera.id)}
          className={`flex flex-col rounded-xl bg-white text-left ${
            camera.id === selected
              ? 'border-2 border-navy px-[15px] pt-[14px] pb-[15px]'
              : 'border border-line px-4 pt-[15px] pb-4 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[15px] leading-6 font-semibold">{camera.id}</span>
            <span
              className={`rounded-full px-2 py-[3px] text-[12px] leading-4 font-semibold ${
                camera.online ? 'bg-blue-100 text-navy' : 'bg-red-100 text-red-800'
              }`}
            >
              {camera.online ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-[13px] leading-[22px] text-slate-600">{camera.place}</p>
          {camera.online ? (
            <>
              <p className="text-[13px] leading-[22px] text-slate-700">
                {camera.fps} FPS · CPU {camera.cpu}% · {camera.model}
              </p>
              <p className="mt-[3px] text-[11.6px] leading-[14px] text-slate-500">
                Last heartbeat {camera.heartbeat} · {camera.queued} events queued
              </p>
            </>
          ) : (
            <>
              <p className="text-[13px] leading-[22px] text-slate-700">No data</p>
              <p className="mt-[3px] text-[11.6px] leading-[14px] text-slate-500">
                Offline since {camera.offlineSince} · events stored on device
              </p>
            </>
          )}
        </button>
      ))}
    </div>
  )
}
