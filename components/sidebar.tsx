'use client' // Required for usePathname

import Link from 'next/link'
import { usePathname } from 'next/navigation' // For active link highlighting
import { Shield, ShoppingCart, Box, Users, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils' // For conditional classes
import { useState } from 'react'

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
      href: `/${storeId}/customers`,
      label: 'Customers',
      icon: <Users className="h-5 w-5 mr-3" />,
      active: pathname === `/${storeId}/customers`
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
    <div className="w-64 bg-gray-800 text-white h-full p-4 space-y-6 flex flex-col">
      <div className="flex items-center justify-between">
        <Link
          href={`/${storeId}`}
          className="text-2xl font-semibold text-center hover:text-gray-300 transition-colors cursor-pointer py-2 block"
        >
          Dashboard
        </Link>
        {/* Close button for mobile */}
        <button
          className="md:hidden p-2 ml-2 text-gray-400 hover:text-white"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex-grow">
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

  return (
    <>
      {/* Hamburger button for mobile */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 p-2 rounded text-white shadow-lg"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>
      {/* Sidebar for desktop only */}
      <div className="hidden md:flex">
        <div className="w-64 bg-gray-800 text-white h-full p-4 space-y-6 flex flex-col fixed inset-y-0 left-0">
          {sidebarContent}
        </div>
      </div>
      {/* Sidebar drawer for mobile, only rendered when open */}
      {open ? (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-50 w-64 h-full bg-gray-800 shadow-xl animate-slide-in-left">
            {sidebarContent}
          </div>
        </div>
      ) : null}
    </>
  )
}

export default Sidebar
