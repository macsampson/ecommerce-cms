import Navbar from '@/components/navbar'
import prismadb from '@/lib/prismadb'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

import Sidebar from '@/components/sidebar' // Import the Sidebar component

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { storeId: string }
}) {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId,
    },
  })

  if (!store) {
    redirect('/')
  }

  return (
    <>
      <Navbar />
      <div className="flex h-screen pt-16"> {/* pt-16 for navbar height */}
        <Sidebar storeId={params.storeId} />
        <main className="flex-1 overflow-y-auto p-4 pl-[272px]"> {/* pl for sidebar width + padding */}
          {children}
        </main>
      </div>
    </>
  )
}
