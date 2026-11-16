import { useRef } from 'react'

// Still image of the camera with its direction zones.
// - drag the white corner squares of the selected zone to resize it
// - click a zone to select it, click its arrow to flip the allowed direction
// Zone positions are percentages of the image, so they fit any screen size.

const looks = {
  up: { arrow: '↑', box: 'border-blue-400 bg-blue-400/[0.18]', label: 'bg-blue-400', icon: 'text-blue-300' },
  down: { arrow: '↓', box: 'border-amber bg-amber/[0.15]', label: 'bg-amber', icon: 'text-yellow-300' },
}
const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
const MIN_SIZE = 5 // percent

export default function ZoneEditor({ zones, countingLines, selected, onSelect, onChangeZone }) {
  const imageRef = useRef(null)

  // Turn the mouse position into percent of the image (0 to 100).
  function pointerPercent(event) {
    const rect = imageRef.current.getBoundingClientRect()
    const clamp = (n) => Math.min(100, Math.max(0, n))
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * 100),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100),
    }
  }

  function dragCorner(event, index, corner) {
    event.stopPropagation()
    const handle = event.currentTarget
    handle.setPointerCapture(event.pointerId)

    function move(moveEvent) {
      const p = pointerPercent(moveEvent)
      const zone = zones[index]
      let left = zone.x
      let top = zone.y
      let right = zone.x + zone.w
      let bottom = zone.y + zone.h
      if (corner.includes('left')) left = Math.min(p.x, right - MIN_SIZE)
      if (corner.includes('right')) right = Math.max(p.x, left + MIN_SIZE)
      if (corner.includes('top')) top = Math.min(p.y, bottom - MIN_SIZE)
      if (corner.includes('bottom')) bottom = Math.max(p.y, top + MIN_SIZE)
      onChangeZone(index, { ...zone, x: left, y: top, w: right - left, h: bottom - top })
    }

    function stop() {
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', stop)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', stop)
  }

  return (
    <div
      ref={imageRef}
      className="relative mt-[5px] h-[446px] touch-none overflow-hidden rounded-[14px] bg-[#3c4856] select-none"
    >
      <div className="absolute inset-x-0 top-0 h-[30%] bg-[#2d3945]" />
      <div className="absolute top-[30%] bottom-0 left-[49.4%] w-2 bg-[#917e3a]" />

      {zones.map((zone, index) => {
        const look = looks[zone.direction]
        const isSelected = index === selected
        return (
          <div
            key={index}
            onPointerDown={() => onSelect(index)}
            className={`absolute border-2 ${look.box}`}
            style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%` }}
          >
            <span
              className={`absolute top-[3px] left-2 rounded-[3px] px-1.5 text-[13px] leading-5 font-semibold whitespace-nowrap text-slate-900 ${look.label}`}
            >
              Zone {String.fromCharCode(65 + index)} · allowed {look.arrow}
            </span>
            <button
              type="button"
              title="Flip the allowed direction"
              onClick={() =>
                onChangeZone(index, { ...zone, direction: zone.direction === 'up' ? 'down' : 'up' })
              }
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[48px] leading-none font-light ${look.icon}`}
            >
              {look.arrow}
            </button>
            {isSelected &&
              corners.map((corner) => (
                <span
                  key={corner}
                  onPointerDown={(event) => dragCorner(event, index, corner)}
                  className={`absolute size-3 cursor-nwse-resize border border-slate-700 bg-white ${
                    corner.includes('top') ? '-top-[7px]' : '-bottom-[7px]'
                  } ${corner.includes('left') ? '-left-[7px]' : '-right-[7px]'}`}
                />
              ))}
          </div>
        )
      })}

      {countingLines.map((y, i) => (
        <div key={i} className="absolute inset-x-0 border-t-2 border-dashed border-white/80" style={{ top: `${y}%` }}>
          <span className="absolute -top-6 right-2 rounded-[3px] bg-white px-1.5 text-[12px] leading-5 font-semibold text-slate-900">
            Counting line {i + 1}
          </span>
        </div>
      ))}
    </div>
  )
}
