import Card from '../components/Card'
import PageHeader from '../components/PageHeader'

// Simple page for screens that are not built yet (Reports, Users & roles).
export default function Placeholder({ title, description, comingLater }) {
  return (
    <>
      <PageHeader title={title}>{description}</PageHeader>
      <Card className="mt-6 p-10 text-center">
        <p className="text-[15px] font-semibold">Coming later in the project</p>
        <p className="mx-auto mt-1 max-w-[520px] text-[14px] text-slate-600">{comingLater}</p>
      </Card>
    </>
  )
}
