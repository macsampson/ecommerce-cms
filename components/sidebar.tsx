'use client' // Required for usePathname

import Link from 'next/link'
import { usePathname } from 'next/navigation' // For active link highlighting
import {
  Shield,
  ShoppingCart,
  Box,
  Users,
  Menu,
  X,
  Edit,
  Truck,
  Percent
} from 'lucide-react'
import { cn } from '@/lib/utils' // For conditional classes
import { useState } from 'react'
import StoreSwitcher from '@/components/store-switcher'

interface SidebarProps {
  storeId: string
}

const Sidebar: React.FC<SidebarProps> = ({ storeId }) => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      href: `/${storeId}`,
      label: 'Overview',
      icon: <Shield className="h-5 w-5 mr-3" />,
      active: pathname === `/${storeId}`
    },
    {
      href: `/${storeId}/orders`,
      label: 'Orders',
      icon: <ShoppingCart className="h-5 w-5 mr-3" />,
      active: pathname === `/${storeId}/orders`
    },
    {
      href: `/${storeId}/products`,
      label: 'Products',
      icon: <Box className="h-5 w-5 mr-3" />,
      active: pathname === `/${storeId}/products`
    },
    {
      href: `/${storeId}/sales`,
      label: 'Sales',
      icon: <Percent className="h-5 w-5 mr-3" />,
      active: pathname === `/${storeId}/sales`
    },
    {
      href: `/${storeId}/customers`,
      label: 'Customers',
      icon: <Users className="h-5 w-5 mr-3" />,
      active: pathname === `/${storeId}/customers`
    },
    {
      href: `/${storeId}/shipping`,
      label: 'Shipping',
      icon: <Truck className="h-5 w-5 mr-3" />,
      active: pathname === `/${storeId}/shipping`
    }
    // Add other routes here if they exist, e.g., Settings, Billboards etc.
    // Example for settings:
    // {
    //   href: `/${storeId}/settings`,
    //   label: 'Settings',
    //   icon: <Settings className="h-5 w-5 mr-3" />, // Assuming Settings icon from lucide-react
    //   active: pathname === `/${storeId}/settings`,
    // },
  ]

  // Sidebar content as a separate variable for reuse
  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/${storeId}`}
          className="text-2xl font-semibold text-center hover:text-gray-300 transition-colors cursor-pointer p-3 md:p-2 block"
        >
          Dashboard
        </Link>
        {/* Close button for mobile */}
        <button
          className="md:hidden p-2 ml-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex-grow p-3 md:p-0">
        <ul className="space-y-2">
          {routes.map((route) => (
            <li key={route.href}>
              <Link
                href={route.href}
                className={cn(
                  'flex items-center p-3 rounded-lg transition-all duration-200 ease-in-out',
                  'hover:bg-gray-700 hover:shadow-lg',
                  route.active
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-gray-300 hover:text-white'
                )}
                onClick={() => setOpen(false)} // Close sidebar on nav click (mobile)
              >
                {route.icon}
                <span className="ml-3">{route.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )

  // Animation classes for mobile sidebar
  const sidebarDrawerClasses = cn(
    'fixed z-50 top-0 left-0 w-64 max-w-[80vw] h-full bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out',
    open ? 'translate-x-0' : '-translate-x-full',
    'md:hidden flex flex-col'
  )
  const overlayClasses = cn(
    'fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity duration-300',
    open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
    'md:hidden'
  )

  return (
    <>
      {/* Hamburger button for mobile */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 p-2 rounded text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
        aria-expanded={open}
        aria-controls="mobile-sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>
      {/* Sidebar for desktop only */}
      <div className="hidden md:flex">
        <div className="w-64 bg-gray-800 text-white h-full p-4 space-y-6 flex flex-col fixed inset-y-0 left-0">
          {sidebarContent}
        </div>
      </div>
      {/* Sidebar drawer for mobile, always rendered for animation */}
      <div
        className={overlayClasses}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <aside
        id="mobile-sidebar"
        className={sidebarDrawerClasses}
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        role="navigation"
      >
        {sidebarContent}
      </aside>
    </>
  )
}

export default Sidebar
