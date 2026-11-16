import { useEffect, useState } from 'react'

// Calls one api function and keeps its result.
// Usage: const { data } = useApi(getSummary)
//        const { data } = useApi(() => getViolation(id), [id])
export function useApi(load, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    load()
      .then((result) => active && setData(result))
      .catch((err) => active && setError(err))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, error, loading: data === null && error === null }
}
