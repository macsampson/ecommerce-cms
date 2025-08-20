import { redirect } from 'next/navigation'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'

import { ThemeToggle } from '@/components/theme-toggle'
import { MainNav } from '@/components/main-nav'
import { LogoutButton } from '@/components/logout-button'
import StoreSwitcher from '@/components/store-switcher'

const Navbar = async () => {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    redirect('/login')
  }

  const stores = await prismadb.store.findMany({
    where: {
      userId: "single-user"
    }
  })

  return (
    <div className="border-b">
      <div className="flex h-16 items-center justify-between px-2 sm:px-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* <StoreSwitcher items={stores} /> */}
          <MainNav className="hidden sm:flex mx-2 sm:mx-6" />
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

export default Navbar
