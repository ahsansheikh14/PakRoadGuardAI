import Button from '../../components/Button'
import Card from '../../components/Card'

// The plate is never shown here; an officer can only ask an administrator for access.
export default function PlateCard({ requested, onRequest }) {
  return (
    <Card className="mt-[18px] p-4">
      <h2 className="text-[16px] leading-6 font-semibold">Number plate</h2>
      <p className="mt-[7px] text-[14px] leading-[21px] text-slate-700">
        The plate is stored encrypted in a separate vault, linked only by this violation ID. Viewing
        it is logged and needs administrator approval.
      </p>
      <Button
        variant="outline"
        disabled={requested}
        onClick={onRequest}
        className="mt-[11px] h-11 px-[17px] font-normal"
      >
        {requested ? 'Access requested' : 'Request plate access'}
      </Button>
    </Card>
  )
}
