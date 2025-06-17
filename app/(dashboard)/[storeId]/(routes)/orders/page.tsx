'use client' // Changed to client component

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'next/navigation'

import { OrderClient } from './components/client'
import { OrderColumn } from './components/columns' // Still needed by OrderClient
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Filter } from 'lucide-react'

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
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false)

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
    // TODO: Replace with a proper loading spinner/skeleton component
    return <div className="flex-1 space-y-4 p-8 pt-6">Loading orders...</div>
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6 text-red-500">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex-1 w-full max-w-full px-2 py-4 sm:px-4 md:px-8 md:py-6 mx-auto">
        <div className="flex items-center gap-2 mb-4">
          {/* Search bar and filter icon */}
          <div className="flex items-center w-full max-w-xs sm:max-w-sm">
            {/* The search bar is rendered inside DataTable, so we just align the filter icon here */}
            <Popover
              open={filterPopoverOpen}
              onOpenChange={setFilterPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant={filter === 'all' ? 'outline' : 'default'}
                  size="icon"
                  className={
                    filter !== 'all' ? 'bg-primary text-primary-foreground' : ''
                  }
                  aria-label="Filter orders"
                >
                  <Filter className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-48 p-0">
                <div className="flex flex-col">
                  <Button
                    variant={filter === 'all' ? 'default' : 'ghost'}
                    className="justify-start rounded-none"
                    onClick={() => {
                      setFilter('all')
                      setFilterPopoverOpen(false)
                    }}
                  >
                    All Orders
                  </Button>
                  <Button
                    variant={filter === 'completed' ? 'default' : 'ghost'}
                    className="justify-start rounded-none"
                    onClick={() => {
                      setFilter('completed')
                      setFilterPopoverOpen(false)
                    }}
                  >
                    Completed
                  </Button>
                  <Button
                    variant={filter === 'abandoned' ? 'default' : 'ghost'}
                    className="justify-start rounded-none"
                    onClick={() => {
                      setFilter('abandoned')
                      setFilterPopoverOpen(false)
                    }}
                  >
                    Abandoned
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <OrderClient data={filteredOrders} />
      </div>
    </div>
  )
}

export default OrdersPage
