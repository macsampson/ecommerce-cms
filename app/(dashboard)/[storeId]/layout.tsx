import Navbar from '@/components/navbar'
import prismadb from '@/lib/prismadb'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

import Sidebar from '@/components/sidebar' // Import the Sidebar component

export default async function DashboardLayout({
  children,
  params
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
      userId
    }
  })

  if (!store) {
    redirect('/')
  }

  return (
    <>
      <Navbar />
      <div className="flex pt-16 min-h-screen">
        <Sidebar storeId={params.storeId} />
        <main className="flex-1 p-2 sm:p-4 md:pl-[272px] md:pr-4">
          {children}
        </main>
      </div>
    </>
  )
}
