'use client'

import React, { useEffect, useState } from 'react'
import { columns } from './columns'
import { DataTable } from '../ui/data-table'
import { useParams } from 'next/navigation'

export type CustomerColumn = {
  id: string
  name: string
  email: string
  phone?: string
  totalOrders: number
  totalSpent: number
}

const CustomerClient: React.FC = () => {
  const params = useParams()
  const storeId = params.storeId
  const [data, setData] = useState<CustomerColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!storeId) return
    setLoading(true)
    setError(null)
    fetch(`/api/${storeId}/customers`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then((customers: CustomerColumn[]) => {
        setData(customers)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load customers')
        setLoading(false)
      })
  }, [storeId])

  if (loading) return <div>Loading customers...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="w-full">
      <DataTable columns={columns} data={data} searchKey="name" />
    </div>
  )
}

export default CustomerClient
