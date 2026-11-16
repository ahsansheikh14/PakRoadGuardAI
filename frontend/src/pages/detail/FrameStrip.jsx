// The last 8 frames of the track. Orange = the rule held in that frame, grey = it did not.
export default function FrameStrip({ track, frames, type, playingFrame }) {
  const met = frames.filter(Boolean).length

  return (
    <div className="mt-[14px]">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] leading-6 font-semibold">Frames of track #{track}</h2>
        <span className="text-[13px] text-slate-600">
          Rule met in {met} of {frames.length} frames
        </span>
      </div>

      <ul className="mt-[2px] grid grid-cols-8 gap-1.5">
        {frames.map((held, i) => (
          <li key={i} className="text-center">
            <div
              className={`h-14 rounded-[4px] border-2 bg-[#36404d] ${
                held ? 'border-orange-500' : 'border-[#7f8ea3]'
              } ${playingFrame === i ? 'ring-2 ring-navy ring-offset-2' : ''}`}
            />
            <span className="mt-1.5 block text-[13px] leading-4 text-slate-600">f{i + 1}</span>
          </li>
        ))}
      </ul>

      <ul className="mt-[7px] flex gap-[15px] text-[12px] leading-4 text-slate-600">
        <li className="flex items-center gap-[5px]">
          <span className="size-[13px] border-2 border-orange-500" />
          {type.seen}
        </li>
        <li className="flex items-center gap-[5px]">
          <span className="size-[13px] border-2 border-[#7f8ea3]" />
          {type.notSeen}
        </li>
      </ul>
    </div>
  )
}
