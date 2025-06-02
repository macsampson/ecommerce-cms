'use client' // Required for usePathname

import Link from 'next/link'
import { usePathname } from 'next/navigation' // For active link highlighting
import { Shield, ShoppingCart, Box, Users } from 'lucide-react'
import { cn } from '@/lib/utils' // For conditional classes

interface SidebarProps {
  storeId: string
}

const Sidebar: React.FC<SidebarProps> = ({ storeId }) => {
  const pathname = usePathname()

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

  return (
    <div className="w-64 bg-gray-800 text-white h-full p-4 space-y-6 flex flex-col fixed inset-y-0 left-0">
      {' '}
      {/* Added fixed positioning and flex-col, space-y-6 */}
      <Link
        href={`/${storeId}`}
        className="text-2xl font-semibold text-center hover:text-gray-300 transition-colors cursor-pointer py-2 block"
      >
        Dashboard
      </Link>
      <nav className="flex-grow">
        {' '}
        {/* Added flex-grow to push items down if footer existed */}
        <ul className="space-y-2">
          {' '}
          {/* Added space-y-2 for list items */}
          {routes.map((route) => (
            <li key={route.href}>
              <Link
                href={route.href}
                className={cn(
                  'flex items-center p-3 rounded-lg transition-all duration-200 ease-in-out', // Increased padding, smoother transition
                  'hover:bg-gray-700 hover:shadow-lg', // Enhanced hover effect
                  route.active
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-gray-300 hover:text-white' // Active link styling
                )}
              >
                {route.icon}
                <span className="ml-3">{route.label}</span>{' '}
                {/* Ensured margin for icon even if label is short */}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {/* Optional: Add a footer here if needed */}
      {/* <div className="mt-auto"> Footer content </div> */}
    </div>
  )
}

export default Sidebar
