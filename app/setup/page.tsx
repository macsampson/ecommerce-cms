import { redirect } from "next/navigation"
import { isAdminConfigured } from "@/lib/auth"
import { SetupForm } from "./setup-form"

export default async function SetupPage() {
  if (await isAdminConfigured()) {
    redirect("/login")
  }

  return <SetupForm />
}
