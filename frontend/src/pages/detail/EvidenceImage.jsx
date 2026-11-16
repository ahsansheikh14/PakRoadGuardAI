// The evidence snapshot with the boxes the edge device drew.
// Faces and the plate are shown blurred, as the device sends them.

function place({ x, y, w, h }) {
  return { left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }
}

export default function EvidenceImage({ scene, label, playingFrame }) {
  return (
    <div className="relative h-[435px] overflow-hidden rounded-[14px] bg-[#3d4756]">
      <div className="absolute inset-x-0 top-0 h-[45%] bg-[#2b3542]" />

      <div className="absolute border-[2.5px] border-orange-500" style={place(scene.box)}>
        <span className="absolute bottom-[calc(100%+8px)] -left-[2.5px] rounded-[3px] bg-orange-700 px-2 text-[13px] leading-5 font-semibold whitespace-nowrap text-white">
          {label}
        </span>
      </div>

      {scene.heads.map((head, i) => (
        <div
          key={i}
          className={`absolute flex items-center justify-center border-2 ${
            head.helmet ? 'border-emerald-400' : 'border-orange-500'
          }`}
          style={place(head)}
        >
          <div className="size-[80%] rounded-full bg-[#8d97a6] blur-[3px]" />
        </div>
      ))}

      <div className="absolute rounded-sm bg-[#8d97a6] blur-[3px]" style={place(scene.plate)} />

      <span className="absolute bottom-3 left-3 rounded-[5px] bg-slate-900/85 px-2 py-1 text-[12px] leading-[15px] text-white">
        Faces and plate blurred on the edge device
      </span>
      {playingFrame !== null && (
        <span className="absolute top-3 left-3 rounded-[5px] bg-slate-900/85 px-2 py-1 text-[12px] leading-[15px] text-white">
          ▶ Playing frame f{playingFrame + 1} of 8
        </span>
      )}
    </div>
  )
}
