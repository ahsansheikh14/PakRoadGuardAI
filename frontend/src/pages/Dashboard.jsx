import { useState } from 'react'
import { getCameras, getDashboard } from '../api'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'
import SampleTag from '../components/SampleTag'
import Select from '../components/Select'
import { useApi } from '../hooks/useApi'
import { downloadCsv } from '../utils/downloadCsv'
import HourlyChart from './dashboard/HourlyChart'
import LatestAlerts from './dashboard/LatestAlerts'
import StatCards from './dashboard/StatCards'
import TypeBreakdown from './dashboard/TypeBreakdown'

export default function Dashboard() {
  const { data } = useApi(getDashboard)
  const { data: cameras } = useApi(getCameras)
  // The two filters are shown but not applied yet: the sample data only covers today.
  const [range, setRange] = useState('today')
  const [cameraId, setCameraId] = useState('all')

  const actions = (
    <>
      <Select
        aria-label="Time range"
        value={range}
        onChange={(e) => setRange(e.target.value)}
        className="w-[130px]"
      >
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="7d">Last 7 days</option>
      </Select>
      <Select
        aria-label="Camera"
        value={cameraId}
        onChange={(e) => setCameraId(e.target.value)}
        className="w-[271px]"
      >
        <option value="all">All cameras</option>
        {cameras?.map((camera) => (
          <option key={camera.id} value={camera.id}>
            {camera.id} · {camera.place}
          </option>
        ))}
      </Select>
      <Button
        variant="outline"
        disabled={!data}
        onClick={() => downloadCsv('violations-report.csv', data.latestAlerts)}
        className="h-11 w-[121px]"
      >
        Export report
      </Button>
    </>
  )

  return (
    <>
      <PageHeader title="Dashboard" actions={actions}>
        Overview of all cameras · <SampleTag />
      </PageHeader>

      {data && (
        <>
          <StatCards summary={data.summary} offlineCamera={data.offlineCamera} />
          <div className="mt-[25px] grid grid-cols-2 gap-4">
            <HourlyChart {...data.violationsByHour} />
            <TypeBreakdown
              byType={data.summary.byType}
              total={data.summary.violationsToday}
              vehicleMix={data.vehicleMix}
            />
          </div>
          <LatestAlerts alerts={data.latestAlerts} />
        </>
      )}
    </>
  )
}
