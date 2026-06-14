import { useMemo, useState } from 'react'

// Shared list-filter state for the dedicated sections: free-text query + year +
// month, applied against each row's date and a text haystack.
export function useListFilters(items, { date, text }) {
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('all')
  const [month, setMonth] = useState('all')

  const years = useMemo(
    () => [...new Set(items.map((i) => date(i).slice(0, 4)))].sort().reverse(),
    [items, date]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((i) => {
      const d = date(i)
      if (year !== 'all' && d.slice(0, 4) !== year) return false
      if (month !== 'all' && Number(d.slice(5, 7)) !== Number(month)) return false
      if (q && !text(i).toLowerCase().includes(q)) return false
      return true
    })
  }, [items, query, year, month, date, text])

  return { query, setQuery, year, setYear, month, setMonth, years, filtered }
}
