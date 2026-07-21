'use client' // Changed to client component

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'next/navigation' // To get storeId

import { AlertTriangle } from 'lucide-react'
import { ProductClient } from './components/client'
import { ProductColumn } from './components/columns' // Still needed by ProductClient
import { Loader } from '@/components/ui/loader'
import { Button } from '@/components/ui/button'

// This type should match the structure returned by your API endpoint
// and be compatible with ProductColumn.
// Based on the API created: app/api/[storeId]/products-summary/route.ts
type ApiProductData = {
  id: string
  name: string
  price: string
  quantity: number
  category: string
  size: string | undefined
  color: string | undefined
  isFeatured: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
  imageUrl?: string | null
}

const ProductsPage = () => {
  const params = useParams() // For getting storeId
  const [products, setProducts] = useState<ProductColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const storeId = params.storeId

  useEffect(() => {
    const fetchProducts = async () => {
      if (!storeId) {
        setLoading(false)
        setError('Store ID not found.')
        return
      }
      try {
        setLoading(true)
        setError(null)
        // Construct API URL (consistent with overview page refactor)

        const apiUrl = `/api/${storeId}/products-summary`

        const response = await axios.get<ApiProductData[]>(apiUrl)

        // The API already returns data in a format compatible with ProductColumn
        // as per the ApiProductSummary type defined in the API route.
        setProducts(response.data)
      } catch (err) {
        console.error('Failed to fetch products:', err)
        setError('Failed to load products. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [storeId])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 pt-24 text-muted-foreground">
        <Loader />
        <p className="text-sm">Pulling stock levels from the shelves…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 pt-24 text-center">
        <AlertTriangle className="h-8 w-8 text-crimson" />
        <p className="font-medium">Couldn&apos;t reach the inventory ledger.</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          The store's stock data didn&apos;t load — your products are safe,
          this is just a connection hiccup. Try again in a moment.
        </p>
        <Button size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex-1 w-full max-w-full px-2 py-4 sm:px-4 md:px-8 md:py-6 mx-auto">
        <ProductClient data={products} />
      </div>
    </div>
  )
}

export default ProductsPage
