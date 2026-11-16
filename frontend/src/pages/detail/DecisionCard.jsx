import { useState } from 'react'
import Button from '../../components/Button'
import Card from '../../components/Card'

// Approve or reject. Rejecting needs a reason; the note is optional.
export default function DecisionCard({ status, reasons, onDecide }) {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const decided = status !== 'pending'

  function decide(newStatus) {
    if (newStatus === 'rejected' && !reason) {
      setError('Choose a reason before rejecting.')
      return
    }
    setError('')
    onDecide({ status: newStatus, reason: newStatus === 'rejected' ? reason : '', note })
  }

  const fieldClass =
    'mt-0.5 block w-full rounded-lg border border-line bg-white px-3.5 text-[15px] focus:border-navy focus:outline-none disabled:bg-slate-50'

  return (
    <Card className="mt-[17px] px-4 pt-4 pb-[18px]">
      <h2 className="text-[16px] leading-6 font-semibold">Your decision</h2>

      <label htmlFor="reason" className="mt-2 block text-[14px] leading-5 font-medium">
        Reason (needed when rejecting)
      </label>
      <select
        id="reason"
        value={reason}
        disabled={decided}
        onChange={(e) => setReason(e.target.value)}
        className={`${fieldClass} h-11`}
      >
        <option value="">—</option>
        {reasons.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>

      <label htmlFor="note" className="mt-[11px] block text-[14px] leading-5 font-medium">
        Note
      </label>
      <textarea
        id="note"
        value={note}
        disabled={decided}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note for the audit log"
        className={`${fieldClass} mt-[5px] h-[72px] pt-3 pb-2 placeholder:text-slate-500`}
      />

      {error && <p className="mt-2 text-[13px] text-red-700">{error}</p>}

      {decided ? (
        <p className="mt-[11px] rounded-lg bg-slate-50 px-3.5 py-3 text-[14px] text-slate-700">
          This violation was {status}. The decision is in the audit trail below.
        </p>
      ) : (
        <div className="mt-[11px] grid grid-cols-2 gap-2">
          <Button
            variant="primary"
            onClick={() => decide('approved')}
            className="h-12 text-[15px] font-semibold"
          >
            Approve violation
          </Button>
          <Button onClick={() => decide('rejected')} className="h-12 text-[15px] font-normal">
            Reject
          </Button>
        </div>
      )}
    </Card>
  )
}
