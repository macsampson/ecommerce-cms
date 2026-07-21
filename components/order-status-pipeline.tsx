import { cn } from '@/lib/utils'
import { Check, X, Clock } from 'lucide-react'

export type OrderStage = 'abandoned' | 'awaiting_payment' | 'paid'

export const getOrderStage = (
  isPaid: boolean,
  isAbandoned: boolean
): OrderStage => {
  if (isAbandoned) return 'abandoned'
  if (isPaid) return 'paid'
  return 'awaiting_payment'
}

export const stageLabel: Record<OrderStage, string> = {
  abandoned: 'Abandoned',
  awaiting_payment: 'Awaiting payment',
  paid: 'Paid'
}

type NodeState = 'done' | 'current' | 'pending' | 'failed'

const steps: { key: 'cart' | 'payment' | 'paid'; label: string }[] = [
  { key: 'cart', label: 'Cart' },
  { key: 'payment', label: 'Payment' },
  { key: 'paid', label: 'Paid' }
]

const nodeStateFor = (stage: OrderStage, key: string): NodeState => {
  if (key === 'cart') return 'done'
  if (key === 'payment') {
    if (stage === 'abandoned') return 'failed'
    return 'done'
  }
  // key === 'paid'
  if (stage === 'paid') return 'done'
  if (stage === 'abandoned') return 'pending'
  return 'current'
}

const nodeClasses: Record<NodeState, string> = {
  done: 'bg-teal text-teal-foreground border-teal',
  current: 'bg-amber text-amber-foreground border-amber animate-pulse',
  failed: 'bg-crimson text-crimson-foreground border-crimson',
  pending: 'bg-muted text-muted-foreground border-border'
}

const lineClasses: Record<NodeState, string> = {
  done: 'bg-teal',
  current: 'bg-amber',
  failed: 'bg-crimson',
  pending: 'bg-border'
}

interface OrderStatusPipelineProps {
  isPaid: boolean
  isAbandoned: boolean
  size?: 'sm' | 'default'
  className?: string
}

export function OrderStatusPipeline({
  isPaid,
  isAbandoned,
  size = 'default',
  className
}: OrderStatusPipelineProps) {
  const stage = getOrderStage(isPaid, isAbandoned)
  const dotSize = size === 'sm' ? 'h-5 w-5' : 'h-7 w-7'
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'

  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, i) => {
        const state = nodeStateFor(stage, step.key)
        const isLast = i === steps.length - 1
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex items-center justify-center rounded-full border font-data',
                  dotSize,
                  nodeClasses[state]
                )}
                title={`${step.label}: ${state}`}
              >
                {state === 'done' && <Check className={iconSize} />}
                {state === 'failed' && <X className={iconSize} />}
                {state === 'current' && <Clock className={iconSize} />}
                {state === 'pending' && (
                  <span className={cn(iconSize, 'block')} />
                )}
              </div>
              {size !== 'sm' && (
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-data">
                  {step.label}
                </span>
              )}
            </div>
            {!isLast && (
              <div
                className={cn(
                  'h-0.5 rounded-full',
                  size === 'sm' ? 'w-4' : 'w-8',
                  lineClasses[nodeStateFor(stage, steps[i + 1].key)]
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
