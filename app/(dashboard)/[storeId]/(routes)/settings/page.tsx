import prismadb from "@/lib/prismadb"
import { isAuthenticated } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SettingsForm } from "./components/settings-form"

interface SettingsPageProps {
  params: {
    storeId: string
  }
}

const SettingsPage: React.FC<SettingsPageProps> = async ({ params }) => {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    redirect("/login")
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId: "single-user",
    },
  })

  if (!store) {
    redirect("/")
  }
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsForm initialData={store} />
      </div>
    </div>
  )
}

export default SettingsPage
