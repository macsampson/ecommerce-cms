import { cache } from 'react'
import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getConfigWarnings } from '@/lib/config-check'
import { ConfigWarningsBanner } from '@/components/config-warnings-banner'

import Sidebar from '@/components/sidebar' // Import the Sidebar component

const getStore = cache((storeId: string) =>
  prismadb.store.findFirst({
    where: {
      id: storeId,
      userId: 'single-user'
    }
  })
)

export async function generateMetadata(
  props: {
    params: Promise<{ storeId: string }>
  }
): Promise<Metadata> {
  const params = await props.params;
  const store = await getStore(params.storeId)

  return {
    title: store ? `${store.name} — Admin` : 'Stockroom',
    description: store
      ? `Order, inventory, and fulfillment console for ${store.name}`
      : 'Order, inventory, and fulfillment console for Stockroom'
  }
}

export default async function DashboardLayout(
  props: {
    children: React.ReactNode
    params: Promise<{ storeId: string }>
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect('/login')
  }

  const store = await getStore(params.storeId)

  if (!store) {
    redirect('/')
  }

  const configWarnings = await getConfigWarnings()

  return (
    <>
      <Navbar />
      <div className="flex pt-16 min-h-screen">
        <Sidebar storeId={params.storeId} storeName={store.name} />
        <main className="flex-1 min-w-0 p-2 sm:p-4 md:pl-[272px] md:pr-4">
          <ConfigWarningsBanner warnings={configWarnings} />
          {children}
        </main>
      </div>
    </>
  )
}
