import React from 'react';
import CustomerClient from '@/components/customers/customer-client';

const CustomersPage = () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <CustomerClient />
      </div>
    </div>
  );
};

export default CustomersPage;
