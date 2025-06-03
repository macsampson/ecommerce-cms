'use client'

import React from 'react'
import { columns } from './columns'
import { DataTable } from '../ui/data-table'

// Dummy data for demonstration
const data = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    totalOrders: 5,
    totalSpent: 200
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '987-654-3210',
    totalOrders: 3,
    totalSpent: 150
  }
]

const CustomerClient: React.FC = () => {
  return (
    <div className="w-full">
      <DataTable columns={columns} data={data} searchKey="name" />
    </div>
  )
}

export default CustomerClient
