"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { ConfigWarning } from "@/lib/config-check"

export function ConfigWarningsBanner({ warnings }: { warnings: ConfigWarning[] }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || warnings.length === 0) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle className="flex items-center justify-between">
        <span>Configuration needed</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4 space-y-1">
          {warnings.map((warning) => (
            <li key={warning.key}>{warning.message}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
