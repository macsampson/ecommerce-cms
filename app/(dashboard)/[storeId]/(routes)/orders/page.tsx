'use client' // Changed to client component

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'next/navigation'

import { OrderClient } from './components/client'
import { OrderColumn } from './components/columns' // Still needed by OrderClient
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { Loader } from '@/components/ui/loader'
import { cn } from '@/lib/utils'

// This type should match the structure returned by your API endpoint (ApiOrderSummary)
// and be compatible with OrderColumn.
type ApiOrderData = {
  id: string
  emailAddress: string
  address: string
  shippingAddress: string
  products: string
  variations: string
  totalPrice: string
  isPaid: boolean
  isAbandoned: boolean
  hasShippingLabel: boolean
  createdAt: string
  phoneNumber: string
  customerName: string
}

const OrdersPage = () => {
  const params = useParams()
  const [orders, setOrders] = useState<OrderColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'abandoned' | 'completed'>(
    'completed'
  ) // default: hide abandoned

  const storeId = params.storeId

  useEffect(() => {
    const fetchOrders = async () => {
      if (!storeId) {
        setLoading(false)
        setError('Store ID not found.')
        return
      }
      try {
        setLoading(true)
        setError(null)
        const apiUrl = `/api/${storeId}/orders-summary`

        const response = await axios.get<ApiOrderData[]>(apiUrl)
        // The API returns data in a format compatible with OrderColumn
        setOrders(response.data)
      } catch (err) {
        console.error('Failed to fetch orders:', err)
        setError('Failed to load orders. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [storeId])

  // Filtering logic
  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true
    if (filter === 'abandoned') return order.isAbandoned
    if (filter === 'completed') return order.isPaid
    return true
  })

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 pt-24 text-muted-foreground">
        <Loader />
        <p className="text-sm">Tallying the order ledger…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 pt-24 text-center">
        <AlertTriangle className="h-8 w-8 text-crimson" />
        <p className="font-medium">Couldn&apos;t load orders.</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          Nothing was lost — this is a connection issue on this screen only.
          Try again in a moment.
        </p>
        <Button size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  const tabs: { key: typeof filter; label: string }[] = [
    { key: 'completed', label: 'Paid' },
    { key: 'abandoned', label: 'Abandoned' },
    { key: 'all', label: 'All' }
  ]

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex-1 w-full max-w-full px-2 py-4 sm:px-4 md:px-8 md:py-6 mx-auto">
        <div className="inline-flex items-center rounded-md border border-border bg-muted/40 p-1 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-sm transition-colors',
                filter === tab.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <OrderClient data={filteredOrders} />
      </div>
    </div>
  )
}

export default OrdersPage
