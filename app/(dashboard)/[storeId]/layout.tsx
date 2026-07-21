import { cache } from 'react'
import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'

import Sidebar from '@/components/sidebar' // Import the Sidebar component

const getStore = cache((storeId: string) =>
  prismadb.store.findFirst({
    where: {
      id: storeId,
      userId: 'single-user'
    }
  })
)

export async function generateMetadata({
  params
}: {
  params: { storeId: string }
}): Promise<Metadata> {
  const store = await getStore(params.storeId)

  return {
    title: store ? `${store.name} — Admin` : 'Cargobay',
    description: store
      ? `Order, inventory, and fulfillment console for ${store.name}`
      : 'Order, inventory, and fulfillment console for Cargobay'
  }
}

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { storeId: string }
}) {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect('/login')
  }

  const store = await getStore(params.storeId)

  if (!store) {
    redirect('/')
  }

  return (
    <>
      <Navbar />
      <div className="flex pt-16 min-h-screen">
        <Sidebar storeId={params.storeId} storeName={store.name} />
        <main className="flex-1 p-2 sm:p-4 md:pl-[272px] md:pr-4">
          {children}
        </main>
      </div>
    </>
  )
}
