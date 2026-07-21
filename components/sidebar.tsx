'use client' // Required for usePathname

import Link from 'next/link'
import { usePathname } from 'next/navigation' // For active link highlighting
import {
  LayoutGrid,
  ShoppingCart,
  Box,
  Users,
  Menu,
  X,
  Truck,
  Percent,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils' // For conditional classes
import { useState } from 'react'

interface SidebarProps {
  storeId: string
  storeName: string
}

const Sidebar: React.FC<SidebarProps> = ({ storeId, storeName }) => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      href: `/${storeId}`,
      label: 'Overview',
      icon: <LayoutGrid className="h-[18px] w-[18px] mr-3" />,
      active: pathname === `/${storeId}`
    },
    {
      href: `/${storeId}/orders`,
      label: 'Orders',
      icon: <ShoppingCart className="h-[18px] w-[18px] mr-3" />,
      active: pathname === `/${storeId}/orders`
    },
    {
      href: `/${storeId}/products`,
      label: 'Inventory',
      icon: <Box className="h-[18px] w-[18px] mr-3" />,
      active: pathname === `/${storeId}/products`
    },
    {
      href: `/${storeId}/sales`,
      label: 'Sales',
      icon: <Percent className="h-[18px] w-[18px] mr-3" />,
      active: pathname === `/${storeId}/sales`
    },
    {
      href: `/${storeId}/customers`,
      label: 'Customers',
      icon: <Users className="h-[18px] w-[18px] mr-3" />,
      active: pathname === `/${storeId}/customers`
    },
    {
      href: `/${storeId}/shipping`,
      label: 'Shipping',
      icon: <Truck className="h-[18px] w-[18px] mr-3" />,
      active: pathname === `/${storeId}/shipping`
    },
    {
      href: `/${storeId}/activity`,
      label: 'Activity log',
      icon: <Activity className="h-[18px] w-[18px] mr-3" />,
      active: pathname === `/${storeId}/activity`
    }
  ]

  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 px-1">
        <Link
          href={`/${storeId}`}
          className="flex items-baseline gap-1.5 font-display font-semibold text-lg tracking-tight hover:text-primary transition-colors p-3 md:p-2"
        >
          {storeName}
          <span className="font-data text-[10px] font-normal tracking-widest text-muted-foreground uppercase">
            Ops
          </span>
        </Link>
        <button
          className="md:hidden p-2 ml-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex-grow px-3 md:px-0">
        <ul className="space-y-1">
          {routes.map((route) => (
            <li key={route.href}>
              <Link
                href={route.href}
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  route.active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={() => setOpen(false)}
              >
                {route.icon}
                <span>{route.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-3 md:px-2 pt-3 border-t border-border/60">
        <p className="font-data text-[10px] text-muted-foreground tracking-wide">
          v1.2.0 · single-store
        </p>
      </div>
    </div>
  )

  const sidebarDrawerClasses = cn(
    'fixed z-50 top-0 left-0 w-64 max-w-[80vw] h-full bg-card border-r border-border shadow-xl transition-transform duration-300 ease-in-out',
    open ? 'translate-x-0' : '-translate-x-full',
    'md:hidden flex flex-col'
  )
  const overlayClasses = cn(
    'fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-300',
    open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
    'md:hidden'
  )

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-card border border-border p-2 rounded-md text-foreground shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
        aria-expanded={open}
        aria-controls="mobile-sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div className="hidden md:flex">
        <div className="w-64 bg-card border-r border-border h-full p-4 flex flex-col fixed inset-y-0 left-0">
          {sidebarContent}
        </div>
      </div>
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
        <div className="p-4 flex-1 flex flex-col">{sidebarContent}</div>
      </aside>
    </>
  )
}

export default Sidebar
