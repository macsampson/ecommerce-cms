'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { AlertTriangle, Radio, ShieldCheck } from 'lucide-react'

import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import type { ApiWebhookEvent } from '@/app/api/[storeId]/webhook-events/route'
import { format } from 'date-fns'

const ActivityPage = () => {
  const params = useParams()
  const storeId = params.storeId
  const [events, setEvents] = useState<ApiWebhookEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!storeId) return
    const fetchEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await axios.get<ApiWebhookEvent[]>(
          `/api/${storeId}/webhook-events`
        )
        setEvents(res.data)
      } catch (err) {
        console.error('Failed to fetch webhook events:', err)
        setError('Failed to load the activity log. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [storeId])

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex-1 w-full max-w-full px-2 py-4 sm:px-4 md:px-8 md:py-6 mx-auto space-y-4">
        <Heading
          title="Activity log"
          description="Every Stripe webhook delivery this store has processed — this is the idempotency ledger, so a missing event was never billed twice."
        />
        <Separator />

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader />
            <p className="text-sm">Reading the delivery ledger…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <AlertTriangle className="h-8 w-8 text-crimson" />
            <p className="font-medium">Couldn&apos;t load the activity log.</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              This is a connection issue on this screen only — no webhook
              deliveries were affected.
            </p>
            <Button size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <ShieldCheck className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No webhook deliveries yet.</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Once Stripe sends a checkout.session.completed event, it&apos;ll
              be recorded here — proof it was received and processed exactly
              once.
            </p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="rounded-md border border-border divide-y divide-border">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 px-4 py-3 text-sm"
              >
                <Radio className="h-4 w-4 text-teal shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-data truncate">
                    checkout.session.completed
                  </p>
                  <p className="text-xs text-muted-foreground font-data truncate">
                    {event.stripeEventId}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground font-data shrink-0">
                  {format(new Date(event.createdAt), 'yyyy-MM-dd hh:mm a')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityPage
