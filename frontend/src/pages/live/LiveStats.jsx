import Card from '../../components/Card'

// Four small boxes under the picture: speed, model, where it runs, vehicles in view.
export default function LiveStats({ camera, feed }) {
  const stats = [
    ['Processing speed', feed ? `${camera.fps} FPS` : '—'],
    ['Model', 'YOLO26n · ONNX'],
    ['Runs on', 'CPU, offline'],
    ['Vehicles in view', feed ? feed.vehiclesInView : '—'],
  ]

  return (
    <div className="mt-[11px] grid grid-cols-4 gap-4">
      {stats.map(([label, value]) => (
        <Card key={label} className="px-3.5 pt-3.5 pb-[14px]">
          <p className="text-[12px] leading-4 text-slate-600">{label}</p>
          <p className="mt-1 text-[20px] leading-[23px] font-semibold">{value}</p>
        </Card>
      ))}
    </div>
  )
}
