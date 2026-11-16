import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Card from '../../components/Card'
import ConfidenceBar from '../../components/ConfidenceBar'
import EvidenceThumb from '../../components/EvidenceThumb'
import SampleTag from '../../components/SampleTag'
import StatusBadge from '../../components/StatusBadge'

// [heading, column width]
const columns = [
  ['Evidence', 'w-[166px]'],
  ['ID', 'w-[96px]'],
  ['Type', 'w-[130px]'],
  ['Camera', 'w-[235px]'],
  ['Time', 'w-[76px]'],
  ['Confidence', 'w-[156px]'],
  ['Status', 'w-[128px]'],
  ['', ''],
]

export default function QueueTable({ items, totalToday }) {
  const navigate = useNavigate()

  return (
    <Card className="mt-5 overflow-hidden">
      <table className="w-full table-fixed text-left text-[14px] leading-5">
        <thead className="bg-[#f9fafc]">
          <tr>
            {columns.map(([name, width], i) => (
              <th key={i} className={`py-2.5 pl-4 font-normal text-slate-600 ${width}`}>
                {name || <span className="sr-only">Action</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((v) => (
            <tr key={v.id} className="border-t border-slate-100">
              <td className="py-2.5 pl-4">
                <EvidenceThumb />
              </td>
              <td className="pl-4 font-mono text-[15px] tracking-[0.05em]">{v.id}</td>
              <td className="pl-4 font-medium">{v.typeLabel}</td>
              <td className="pl-4">{v.cameraName}</td>
              <td className="pl-4 text-[15px]">{v.time}</td>
              <td className="pl-4">
                <ConfidenceBar value={v.confidence} />
              </td>
              <td className="pl-4">
                <StatusBadge status={v.status} />
              </td>
              <td className="pl-4">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/violations/${v.id}`)}
                  className="h-10 w-[76px] font-semibold"
                >
                  Review
                </Button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr className="border-t border-slate-100">
              <td colSpan={columns.length} className="py-10 text-center text-slate-500">
                No violations match these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-slate-100 py-3 pr-4 pl-4">
        <p className="text-[13px] text-slate-600">
          Showing {items.length} of {totalToday} today · <SampleTag className="text-slate-600" />
        </p>
        <div className="flex gap-2">
          {/* All sample rows fit on one page, so paging is not active yet. */}
          <Button className="h-10 px-[14px] text-[13px]">Previous</Button>
          <Button className="h-10 px-[14px] text-[13px]">Next</Button>
        </div>
      </div>
    </Card>
  )
}
