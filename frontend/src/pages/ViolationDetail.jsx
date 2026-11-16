import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { decideViolation, getViolation, requestPlateAccess } from '../api'
import { useRole } from '../auth/RoleContext'
import Button from '../components/Button'
import SampleTag from '../components/SampleTag'
import StatusBadge from '../components/StatusBadge'
import { downloadJson } from '../utils/downloadJson'
import DecisionCard from './detail/DecisionCard'
import EvidenceImage from './detail/EvidenceImage'
import FrameStrip from './detail/FrameStrip'
import PlateCard from './detail/PlateCard'
import SystemFacts from './detail/SystemFacts'

const statusLabels = { pending: 'Pending review', approved: 'Approved', rejected: 'Rejected' }

export default function ViolationDetail() {
  const { id } = useParams()
  const { role } = useRole()
  const [violation, setViolation] = useState(undefined) // undefined = loading, null = not found
  const player = useClipPlayer()

  useEffect(() => {
    getViolation(id).then(setViolation)
  }, [id])

  if (violation === undefined) return null
  if (violation === null) {
    return (
      <>
        <BackLink />
        <p className="mt-6 text-[15px]">No violation with ID {id}.</p>
      </>
    )
  }

  const decide = (decision) =>
    decideViolation(id, { ...decision, by: role.label }).then(setViolation)
  const requestPlate = () => requestPlateAccess(id, role.label).then(setViolation)

  return (
    <>
      <BackLink />
      <div className="mt-[18px] flex items-center gap-4">
        <h1 className="font-display text-[28px] leading-9 font-medium">
          {violation.typeInfo.long} · {violation.id}
        </h1>
        <StatusBadge status={violation.status} label={statusLabels[violation.status]} />
      </div>
      <p className="mt-px text-[14px] text-slate-600">
        {violation.cameraPlace} · {formatDate(violation.date)}, {violation.seconds} ·{' '}
        <SampleTag className="text-slate-600" />
      </p>

      <div className="mt-[18px] grid grid-cols-[1fr_339px] gap-5">
        <div>
          <EvidenceImage
            scene={violation.scene}
            label={`${violation.vehicle} #${violation.track}${
              violation.type === 'triple-riding' ? ' · 3 riders' : ''
            }`}
            playingFrame={player.frame}
          />
          <FrameStrip
            track={violation.track}
            frames={violation.frames}
            type={violation.typeInfo}
            playingFrame={player.frame}
          />
          <div className="mt-[11px] flex gap-2">
            <Button onClick={player.play} className="h-11 px-4 font-normal">
              ▶ Play 4-second clip
            </Button>
            <Button
              onClick={() => downloadJson(`${violation.id}-evidence.json`, violation)}
              className="h-11 px-4 font-normal"
            >
              Download evidence
            </Button>
          </div>
        </div>

        <div>
          <SystemFacts violation={violation} />
          <PlateCard requested={violation.plateRequested} onRequest={requestPlate} />
          <DecisionCard
            key={violation.id}
            status={violation.status}
            reasons={violation.rejectReasons}
            onDecide={decide}
          />
          <AuditTrail lines={violation.audit} />
        </div>
      </div>
    </>
  )
}

function BackLink() {
  return (
    <Link to="/violations" className="text-[14px] leading-5 text-link hover:underline">
      ← Back to review queue
    </Link>
  )
}

function AuditTrail({ lines }) {
  return (
    <div className="mt-4 px-[3px]">
      <h2 className="text-[14px] leading-6 font-semibold">Audit trail</h2>
      <ul className="mt-0.5 text-[13px] leading-[21.5px] text-slate-600">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  )
}

// There is no video yet: "Play" steps through the 8 frames in 4 seconds (0.5 s each).
function useClipPlayer() {
  const [frame, setFrame] = useState(null)

  useEffect(() => {
    if (frame === null) return
    const timer = setTimeout(() => setFrame(frame < 7 ? frame + 1 : null), 500)
    return () => clearTimeout(timer)
  }, [frame])

  return { frame, play: () => setFrame(0) }
}

// "2026-11-14" -> "14 Nov 2026"
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
