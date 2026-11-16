import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import StatusBadge from '../../components/StatusBadge'

// [heading, column width]
const columns = [
  ['Time', 'w-[91px]'],
  ['Type', 'w-[164px]'],
  ['Camera', 'w-[300px]'],
  ['Vehicle', 'w-[223px]'],
  ['Confidence', 'w-[162px]'],
  ['Status', ''],
]

// Table of the newest detections, with links to their review pages.
export default function LatestAlerts({ alerts }) {
  return (
    <Card className="mt-[25px] px-5 pt-[17px] pb-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] leading-6 font-semibold">Latest alerts</h2>
        <Link to="/violations" className="text-[14px] text-link underline">
          See all
        </Link>
      </div>

      <table className="mt-[10px] w-full table-fixed text-left text-[14px] leading-5">
        <thead>
          <tr className="border-b border-line">
            {columns.map(([name, width]) => (
              <th key={name} className={`px-2 py-2 font-normal text-slate-600 ${width}`}>
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id} className="border-b border-slate-100 last:border-0">
              <td className="px-2 py-2.5">{alert.time}</td>
              <td className="px-2">
                <Link to={`/violations/${alert.id}`} className="text-link underline">
                  {alert.typeLabel}
                </Link>
              </td>
              <td className="px-2">{alert.cameraName}</td>
              <td className="px-2">
                {alert.vehicle} · track #{alert.track}
              </td>
              <td className="px-2">{alert.confidence.toFixed(2)}</td>
              <td className="px-2">
                <StatusBadge status={alert.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
