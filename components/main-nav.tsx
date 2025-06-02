"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname()
  const params = useParams()

  const routes: { href: string; label: string; active: boolean }[] = [] // No routes here anymore, they are in Sidebar

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {/* Links are removed as they are now in the Sidebar */}
      {/* You can add other elements here if needed in the future, like a breadcrumb */}
    </nav>
  )
}
