import { redirect } from "next/navigation"
import { isAdminConfigured } from "@/lib/auth"
import { LoginForm } from "./login-form"

export default async function LoginPage() {
  if (!(await isAdminConfigured())) {
    redirect("/setup")
  }

  return <LoginForm />
}
