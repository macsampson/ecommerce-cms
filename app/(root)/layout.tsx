import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

import prismadb from "@/lib/prismadb"

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect("/login")
  }

  const store = await prismadb.store.findFirst({
    where: {
      userId: "single-user",
    },
  })

  if (store) {
    redirect(`/${store.id}`)
  }

  return <>{children}</>
}
