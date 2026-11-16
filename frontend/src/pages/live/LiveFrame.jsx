// The camera picture with the boxes the edge device drew.
// There is no real video yet, so the road is drawn with plain shapes.

const boxColors = {
  vehicle: { border: 'border-blue-400', label: 'bg-blue-400 text-slate-900' },
  violation: { border: 'border-orange-500', label: 'bg-orange-700 text-white' },
  helmet: { border: 'border-emerald-400', label: 'bg-emerald-400 text-slate-900' },
}

// Position an element with percentages of the frame.
function place({ x, y, w, h }) {
  return { left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }
}

export default function LiveFrame({ camera, feed }) {
  return (
    <div className="relative h-[437px] overflow-hidden rounded-[14px] bg-[#394553]">
      {feed ? <Scene feed={feed} /> : <Offline camera={camera} />}

      <div className="absolute top-3 left-3 flex gap-1.5">
        {feed && <Tag className="bg-red-700 font-semibold">● LIVE</Tag>}
        <Tag className="bg-slate-900/85">
          {camera.id} · {camera.place}
        </Tag>
      </div>
      {feed && <Tag className="absolute top-3 right-3 bg-slate-900/85">{feed.time}</Tag>}
    </div>
  )
}

function Scene({ feed }) {
  return (
    <>
      {/* sky, then three lane lines on the road */}
      <div className="absolute inset-x-0 top-0 h-[30%] bg-[#25313f]" />
      <div className="absolute top-[30%] bottom-0 left-[18.3%] w-[3px] bg-[#737b86]" />
      <div className="absolute top-[30%] bottom-0 left-[49.4%] w-2 bg-[#8c8036]" />
      <div className="absolute top-[30%] bottom-0 left-[80.2%] w-[3px] bg-[#737b86]" />

      {feed.zones.map((zone) => (
        <div
          key={zone.label}
          className="absolute border-2 border-dashed border-amber bg-amber/[0.07]"
          style={place(zone)}
        >
          <span className="absolute top-[3px] left-[2px] rounded-[3px] bg-amber px-1.5 text-[12px] leading-[18px] font-semibold whitespace-nowrap text-slate-900">
            {zone.label}
          </span>
        </div>
      ))}

      {feed.detections.map((box, i) => (
        <div
          key={i}
          className={`absolute border-2 ${boxColors[box.kind].border}`}
          style={place(box)}
        >
          {box.label && (
            <span
              className={`absolute bottom-[calc(100%+7px)] -left-0.5 rounded-[3px] px-1.5 text-[12px] leading-[18px] font-semibold whitespace-nowrap ${boxColors[box.kind].label}`}
            >
              {box.label}
            </span>
          )}
        </div>
      ))}
    </>
  )
}

function Offline({ camera }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#25313f] text-center">
      <p className="text-[17px] font-semibold text-white">{camera.id} is offline</p>
      <p className="mt-1 text-[14px] text-slate-300">
        No picture since {camera.offlineSince}. Events are stored on the device until it reconnects.
      </p>
    </div>
  )
}

function Tag({ className, children }) {
  return (
    <span className={`rounded-[5px] px-2 py-1 text-[12px] leading-[15px] text-white ${className}`}>
      {children}
    </span>
  )
}
