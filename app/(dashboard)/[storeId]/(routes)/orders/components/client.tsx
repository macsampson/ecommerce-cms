'use client'

import { PackageX } from 'lucide-react'

import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { OrderColumn, columns } from './columns'
import { DataTable } from '@/components/ui/data-table'
import { ShippingLabelSection } from './shipping-label-section'
import {
  OrderStatusPipeline,
  getOrderStage,
  stageLabel
} from '@/components/order-status-pipeline'

interface OrderClientProps {
  data: OrderColumn[]
}

const OrderDetail = ({ order }: { order: OrderColumn }) => {
  const stage = getOrderStage(order.isPaid, order.isAbandoned)
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{order.customerName || 'Guest'}</p>
          <p className="text-xs font-data text-muted-foreground">
            {order.id}
          </p>
        </div>
        <span className="font-data text-lg tabular-nums">
          {order.totalPrice}
        </span>
      </div>
      <div className="rounded-md border border-border p-4 bg-muted/40">
        <OrderStatusPipeline
          isPaid={order.isPaid}
          isAbandoned={order.isAbandoned}
        />
        <p className="text-xs text-muted-foreground mt-3">
          {stage === 'abandoned' &&
            'Checkout was started but never completed — no payment was captured.'}
          {stage === 'awaiting_payment' &&
            'Checkout is in progress. Stripe has not confirmed payment yet.'}
          {stage === 'paid' &&
            'Payment confirmed by Stripe. Ready to pick, pack, and ship.'}
        </p>
      </div>
      <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Email</dt>
        <dd className="col-span-2 break-all">{order.emailAddress || '—'}</dd>
        <dt className="text-muted-foreground">Phone</dt>
        <dd className="col-span-2">{order.phoneNumber || '—'}</dd>
        <dt className="text-muted-foreground">Ship to</dt>
        <dd className="col-span-2 whitespace-pre-line">
          {order.shippingAddress || '—'}
        </dd>
        <dt className="text-muted-foreground">Bill to</dt>
        <dd className="col-span-2 whitespace-pre-line">
          {order.address || '—'}
        </dd>
        <dt className="text-muted-foreground">Placed</dt>
        <dd className="col-span-2 font-data">{order.createdAt}</dd>
      </dl>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
          Items
        </p>
        <pre className="whitespace-pre-wrap text-sm font-body bg-muted/40 rounded-md p-3 border border-border">
          {order.products || 'No line items recorded.'}
        </pre>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
          Shipping Label
        </p>
        {order.isPaid ? (
          <ShippingLabelSection orderId={order.id} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Available once payment is confirmed.
          </p>
        )}
      </div>
    </div>
  )
}

export const OrderClient: React.FC<OrderClientProps> = ({ data }) => {
  return (
    <>
      <Heading
        title={`Orders (${data.length})`}
        description="Every checkout, from cart to cleared payment. Click a row for the full pipeline."
      />
      <Separator />
      <div className="w-full">
        <DataTable
          columns={columns}
          data={data}
          searchKey="emailAddress"
          searchPlaceholder="Search by email…"
          renderDetail={(order) => <OrderDetail order={order} />}
          emptyState={
            <div className="flex flex-col items-center gap-2 py-6">
              <PackageX className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No orders match this view.</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Once a customer checks out — or abandons a cart — it&apos;ll
                show up here.
              </p>
            </div>
          }
        />
      </div>
    </>
  )
}
