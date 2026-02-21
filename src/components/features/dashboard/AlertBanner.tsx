import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AlertBannerProps {
  expiring: number
  expired: number
  workspaceId: string
}

export function AlertBanner({ expiring, expired, workspaceId }: AlertBannerProps) {
  if (expiring === 0 && expired === 0) return null

  const parts: string[] = []
  if (expired > 0) parts.push(`${expired} expired`)
  if (expiring > 0) parts.push(`${expiring} expiring soon`)

  return (
    <Alert className="border-amber-300 bg-amber-50 text-amber-900">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between">
        <span>You have {parts.join(" and ")} document{parts.length > 1 || (expiring + expired) !== 1 ? "s" : ""}.</span>
        <Link
          href={`/${workspaceId}/documents/expiring`}
          className="font-medium underline hover:no-underline ml-4 whitespace-nowrap"
        >
          View expiring documents →
        </Link>
      </AlertDescription>
    </Alert>
  )
}
