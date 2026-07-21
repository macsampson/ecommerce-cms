import Link from 'next/link'
import { Radio } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WebhookEventEntry } from '@/actions/get-recent-webhook-events'
import { formatDistanceToNow } from 'date-fns'

interface RecentActivityCardProps {
  events: WebhookEventEntry[]
  storeId: string
}

export function RecentActivityCard({
  events,
  storeId
}: RecentActivityCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">
          Recent webhook activity
        </CardTitle>
        <Link
          href={`/${storeId}/activity`}
          className="text-xs text-primary hover:underline"
        >
          View log
        </Link>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            No Stripe events recorded yet. Once checkout starts firing
            webhooks, deliveries will show up here in real time.
          </p>
        ) : (
          <ul className="space-y-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center gap-3 text-sm"
              >
                <Radio className="h-3.5 w-3.5 text-teal shrink-0" />
                <span className="font-data flex-1 truncate">
                  checkout.session.completed
                </span>
                <span className="text-xs text-muted-foreground font-data shrink-0">
                  {formatDistanceToNow(new Date(event.createdAt), {
                    addSuffix: true
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
