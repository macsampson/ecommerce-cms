'use client' // Changed to client component

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'next/navigation'

import { OrderClient } from './components/client'
import { OrderColumn } from './components/columns' // Still needed by OrderClient

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
}

const OrdersPage = () => {
  const params = useParams()
  const [orders, setOrders] = useState<OrderColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        <OrderClient data={orders} />
      </div>
    </div>
  )
}

export default OrdersPage
