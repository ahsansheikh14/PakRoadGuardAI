// The ONLY place the pages get data from.
// Today every function returns the sample data in src/data/.
// Later, replace a function's body with a call to the FastAPI backend, e.g.
//   return fetch('/api/violations').then((res) => res.json())
// and no page has to change.

import { cameras } from '../data/cameras'
import { vehicleMix, violationsByHour } from '../data/dashboard'
import { liveEvents, liveFeeds } from '../data/live'
import { roles } from '../data/roles'
import { summary } from '../data/summary'
import { evidenceScenes, pastDecisions, violationDetails } from '../data/violationDetails'
import { rejectReasons, violations, violationTypes } from '../data/violations'
import { cameraSetups } from '../data/zones'

// Pretend to be a network call: return a copy, asynchronously.
function respond(data) {
  return Promise.resolve(structuredClone(data))
}

export function getRoles() {
  return respond(roles)
}

export function getSummary() {
  return respond(summary)
}

export function getCameras() {
  return respond(cameras)
}

// Adds the names shown on screen, e.g. "CAM-02 · H-11 slip road" and "Wrong-way".
function withNames(violation) {
  const camera = cameras.find((c) => c.id === violation.camera)
  return {
    ...violation,
    cameraName: `${camera.id} · ${camera.short}`,
    typeLabel: violationTypes[violation.type].short,
  }
}

// Everything the dashboard needs in one call.
export function getDashboard() {
  return respond({
    summary,
    violationsByHour,
    vehicleMix,
    latestAlerts: violations.slice(0, 4).map(withNames),
    offlineCamera: cameras.find((camera) => !camera.online),
  })
}

// Live view of one camera: its detections (null when offline), stats and recent events.
export function getLiveFeed(cameraId) {
  const camera = cameras.find((c) => c.id === cameraId)
  return respond({ camera, feed: liveFeeds[cameraId], events: liveEvents })
}

// filters: { type: 'all' | 'no-helmet' | ..., status: 'all' | 'pending' | ..., date: 'YYYY-MM-DD', search: '' }
export function getViolations(filters) {
  const search = filters.search.trim().toLowerCase()
  const items = violations.filter(
    (v) =>
      (filters.type === 'all' || v.type === filters.type) &&
      (filters.status === 'all' || v.status === filters.status) &&
      (!filters.date || v.date === filters.date) &&
      (!search || v.id.toLowerCase().includes(search) || String(v.track).includes(search)),
  )
  return respond({ items: items.map(withNames), totalToday: summary.violationsToday })
}

// ---------- Violation review page ----------

// Things that happened after detection (plate requests, decisions). The backend will keep this later.
const auditLog = {}
const plateRequests = new Set()
for (const [id, d] of Object.entries(pastDecisions)) {
  const v = violations.find((item) => item.id === id)
  const verb = v.status === 'approved' ? 'Approved' : 'Rejected'
  auditLog[id] = [`${d.time} · ${verb} by ${d.by}${d.reason ? ` (${d.reason})` : ''}`]
}

// Everything the review page needs for one violation, or null if the ID is unknown.
export function getViolation(id) {
  const violation = violations.find((v) => v.id === id)
  if (!violation) return respond(null)

  const details = violationDetails[id]
  const camera = cameras.find((c) => c.id === violation.camera)
  const type = violationTypes[violation.type]
  const uploaded = addSeconds(details.seconds, 7)

  return respond({
    ...withNames(violation),
    ...details,
    cameraPlace: `${camera.id} · ${camera.place}`,
    typeInfo: type,
    scene: evidenceScenes[violation.type],
    rejectReasons,
    plateRequested: plateRequests.has(id),
    audit: [
      `${details.seconds} · Detected on ${camera.id} (edge)`,
      `${uploaded} · Uploaded to server`,
      ...(auditLog[id] ?? []),
      ...(violation.status === 'pending' ? ["Waiting for an officer's decision"] : []),
    ],
  })
}

// decision: { status: 'approved' | 'rejected', reason, note, by }
export function decideViolation(id, decision) {
  const violation = violations.find((v) => v.id === id)
  if (violation.status === 'pending') summary.pendingReviews -= 1
  violation.status = decision.status
  const verb = decision.status === 'approved' ? 'Approved' : 'Rejected'
  const extra = [decision.reason, decision.note].filter(Boolean).join(' · ')
  addToAudit(id, `${verb} by ${decision.by}${extra ? ` (${extra})` : ''}`)
  return getViolation(id)
}

export function requestPlateAccess(id, by) {
  plateRequests.add(id)
  addToAudit(id, `Plate access requested by ${by}, waiting for an administrator`)
  return getViolation(id)
}

function addToAudit(id, text) {
  const time = new Date().toLocaleTimeString('en-GB')
  auditLog[id] = [...(auditLog[id] ?? []), `${time} · ${text}`]
}

// "10:39:51" + 7 -> "10:39:58"
function addSeconds(time, seconds) {
  const [h, m, s] = time.split(':').map(Number)
  const total = h * 3600 + m * 60 + s + seconds
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`
}

// ---------- Cameras & zones page ----------

export function getCameraSetup(cameraId) {
  return respond(cameraSetups[cameraId])
}

// Stores the zones and settings. The device picks them up at its next heartbeat.
export function saveCameraSetup(cameraId, setup) {
  cameraSetups[cameraId] = structuredClone(setup)
  return respond({ savedAt: new Date().toLocaleTimeString('en-GB') })
}
