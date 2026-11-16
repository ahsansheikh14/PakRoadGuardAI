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
import { violations, violationTypes } from '../data/violations'

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

export function getViolationTypes() {
  return respond(violationTypes)
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
