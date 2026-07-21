import {
  CRITICAL_STOCK_THRESHOLD,
  LOW_STOCK_THRESHOLD
} from '@/actions/get-low-stock-products'
import { cn } from '@/lib/utils'
import { CSSProperties } from 'react'

// Stock level beyond which a row reads as "fully healthy" for gauge purposes.
// Not a hard business rule — just where the fill bar tops out visually.
const STOCK_CAP = 30

export type StockLevel = 'critical' | 'low' | 'healthy'

export const getStockLevel = (quantity: number): StockLevel => {
  if (quantity <= CRITICAL_STOCK_THRESHOLD) return 'critical'
  if (quantity <= LOW_STOCK_THRESHOLD) return 'low'
  return 'healthy'
}

const levelColorVar: Record<StockLevel, string> = {
  critical: '--signal-crimson',
  low: '--signal-amber',
  healthy: '--signal-teal'
}

export const getStockRowStyle = (quantity: number): CSSProperties => {
  const ratio = Math.min(quantity / STOCK_CAP, 1)
  const level = getStockLevel(quantity)
  const colorVar = levelColorVar[level]
  const pct = Math.max(ratio * 100, quantity > 0 ? 4 : 0)

  return {
    backgroundImage: `linear-gradient(to right, hsl(var(${colorVar}) / 0.16) 0%, hsl(var(${colorVar}) / 0.16) ${pct}%, transparent ${pct}%, transparent 100%)`
  }
}

const levelDot: Record<StockLevel, string> = {
  critical: 'bg-crimson',
  low: 'bg-amber',
  healthy: 'bg-teal'
}

export function StockLevelBadge({ quantity }: { quantity: number }) {
  const level = getStockLevel(quantity)
  return (
    <div className="flex items-center gap-2 font-data">
      <span className={cn('h-2 w-2 rounded-full shrink-0', levelDot[level])} />
      <span className="tabular-nums">{quantity}</span>
    </div>
  )
}
