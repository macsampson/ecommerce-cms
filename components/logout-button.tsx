"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import toast from "react-hot-toast"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Logged out successfully")
        router.push("/login")
        router.refresh()
      } else {
        toast.error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("An error occurred during logout")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLogout}
      disabled={isLoading}
      className="h-9 w-9"
    >
      <LogOut className="h-4 w-4" />
      <span className="sr-only">Logout</span>
    </Button>
  )
}