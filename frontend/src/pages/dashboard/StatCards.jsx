import { Link } from 'react-router-dom'
import Card from '../../components/Card'

// The four number boxes at the top of the dashboard.
export default function StatCards({ summary, offlineCamera }) {
  const { byType } = summary
  return (
    <div className="mt-[21px] grid grid-cols-4 gap-4">
      <StatCard label="Violations detected today" value={summary.violationsToday}>
        {byType['no-helmet']} no helmet · {byType['wrong-way']} wrong-way ·{' '}
        {byType['triple-riding']} triple riding
      </StatCard>

      <StatCard label="Waiting for review" value={summary.pendingReviews} valueClass="text-amber-700">
        <Link to="/violations" className="text-link underline">
          Open review queue
        </Link>
      </StatCard>

      <StatCard
        label="Edge cameras online"
        value={summary.camerasOnline}
        suffix={`/ ${summary.camerasTotal}`}
      >
        {offlineCamera && (
          <span className="text-red-700">
            {offlineCamera.id} offline since {offlineCamera.offlineSince}
          </span>
        )}
      </StatCard>

      <StatCard label="Vehicles counted today" value={summary.vehiclesToday.toLocaleString('en-US')}>
        Across {summary.camerasOnline} online cameras
      </StatCard>
    </div>
  )
}

function StatCard({ label, value, suffix, valueClass = '', children }) {
  return (
    <Card className="px-5 py-[18px]">
      <p className="text-[13px] leading-[18px] text-slate-600">{label}</p>
      <p className={`mt-[7px] font-display text-[34px] leading-10 font-semibold ${valueClass}`}>
        {value}
        {suffix && <span className="ml-2 text-[19px] leading-none font-medium text-slate-500">{suffix}</span>}
      </p>
      <p className="mt-2 text-[13px] leading-4 text-slate-600">{children}</p>
    </Card>
  )
}
