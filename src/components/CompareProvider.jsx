import { useCallback, useEffect, useMemo, useState } from 'react'
import { productBySlug } from '../lib/data.js'
import { COMPARE_MAX, COMPARE_STORAGE_KEY, CompareContext } from '../lib/compare.js'

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved.filter(productBySlug).slice(0, COMPARE_MAX) : []
  } catch {
    return []
  }
}

export default function CompareProvider({ children }) {
  const [slugs, setSlugs] = useState(loadSaved)

  useEffect(() => {
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(slugs))
    } catch {
      // storage unavailable (private mode): compare still works for this visit
    }
  }, [slugs])

  const toggle = useCallback((slug) => {
    setSlugs((cur) => {
      if (cur.includes(slug)) return cur.filter((s) => s !== slug)
      if (cur.length >= COMPARE_MAX) return [...cur.slice(1), slug] // drop the oldest pick
      return [...cur, slug]
    })
  }, [])

  const value = useMemo(
    () => ({ slugs, toggle, has: (slug) => slugs.includes(slug), clear: () => setSlugs([]) }),
    [slugs, toggle],
  )
  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}
