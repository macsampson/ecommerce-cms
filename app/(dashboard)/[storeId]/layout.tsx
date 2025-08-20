import Navbar from '@/components/navbar'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'

import Sidebar from '@/components/sidebar' // Import the Sidebar component

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

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId: "single-user"
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
