import { products } from './data.js'
import { firstNumber } from './format.js'

// Price bands used on the compare page ("5 jt-an" = Rp 5.000.000–5.999.999)
export const BUDGETS = [
  { id: 'lt5', label: 'Di bawah 5 jt', test: (p) => p.price > 0 && p.price < 5e6 },
  { id: '5', label: '5 jt-an', test: (p) => p.price >= 5e6 && p.price < 6e6 },
  { id: '6', label: '6 jt-an', test: (p) => p.price >= 6e6 && p.price < 7e6 },
  { id: '7', label: '7 jt-an', test: (p) => p.price >= 7e6 && p.price < 8e6 },
  { id: '8-10', label: '8–10 jt', test: (p) => p.price >= 8e6 && p.price < 10e6 },
  { id: 'gt10', label: '10 jt ke atas', test: (p) => p.price >= 10e6 },
]

export const budgetById = (id) => BUDGETS.find((b) => b.id === id)
export const inBudget = (id) => products.filter(budgetById(id)?.test ?? (() => false))

// Quick-compare pick: longest range first (then top speed, then cheaper), one model per brand where possible
export function topPicks(list, n) {
  const ranked = [...list].sort(
    (a, b) =>
      (firstNumber(b.specs['Jarak Tempuh']) ?? 0) - (firstNumber(a.specs['Jarak Tempuh']) ?? 0) ||
      (firstNumber(b.specs['Kecepatan Max']) ?? 0) - (firstNumber(a.specs['Kecepatan Max']) ?? 0) ||
      a.price - b.price,
  )
  const picked = []
  const brands = new Set()
  for (const p of ranked) {
    if (picked.length < n && !brands.has(p.brand)) {
      picked.push(p)
      brands.add(p.brand)
    }
  }
  for (const p of ranked) if (picked.length < n && !picked.includes(p)) picked.push(p)
  return picked
}
