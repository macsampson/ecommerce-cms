import React from 'react'
import CustomerClient from '@/components/customers/customer-client'

const CustomersPage = () => {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex-1 w-full max-w-full px-2 py-4 sm:px-4 md:px-8 md:py-6 mx-auto space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Customers</h1>
        <CustomerClient />
      </div>
    </div>
  )
}

export default CustomersPage
