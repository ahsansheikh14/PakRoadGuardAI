// The ONLY place the pages get data from.
// Today every function returns the sample data in src/data/.
// Later, replace the body with a call to the FastAPI backend, e.g.
//   return fetch('/api/summary').then((res) => res.json())
// and no page has to change.

import { roles } from '../data/roles'
import { summary } from '../data/summary'

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
