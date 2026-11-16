import { useState } from 'react'
import { getViolations } from '../api'
import PageHeader from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import QueueFilters from './violations/QueueFilters'
import QueueTable from './violations/QueueTable'

const startFilters = { type: 'all', status: 'all', date: '2026-11-14', search: '' }

export default function Violations() {
  const [filters, setFilters] = useState(startFilters)
  const { data } = useApi(() => getViolations(filters), [filters])

  return (
    <>
      <PageHeader title="Violations review queue">
        Every detection waits here until an officer approves or rejects it. Nothing is sent onward
        automatically.
      </PageHeader>
      <QueueFilters filters={filters} onChange={setFilters} />
      {data && <QueueTable items={data.items} totalToday={data.totalToday} />}
    </>
  )
}
