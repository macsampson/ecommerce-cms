import prismadb from "@/lib/prismadb"
import { isAuthenticated } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ApiDocsView } from "./components/api-docs-view"

interface ApiDocsPageProps {
  params: {
    storeId: string
  }
}

const ApiDocsPage: React.FC<ApiDocsPageProps> = async props => {
  const params = await props.params;
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

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(o => o.trim()).filter(Boolean) ?? []

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ApiDocsView allowedOrigins={allowedOrigins} />
      </div>
    </div>
  )
}

export default ApiDocsPage
