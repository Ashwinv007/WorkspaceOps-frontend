import Link from "next/link"
import { AlertTriangle, ArrowRight } from "lucide-react"
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
    <Alert className="border-warning/30 bg-warning/8 text-foreground">
      <AlertTriangle className="h-4 w-4 text-warning-foreground" />
      <AlertDescription className="flex items-center justify-between">
        <span>You have {parts.join(" and ")} document{parts.length > 1 || (expiring + expired) !== 1 ? "s" : ""}.</span>
        <Link
          href={`/${workspaceId}/documents?expiryStatus=${expired > 0 && expiring === 0 ? "EXPIRED" : "EXPIRING"}`}
          className="flex items-center gap-1 font-medium underline hover:no-underline ml-4 whitespace-nowrap"
        >
          Review documents
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </AlertDescription>
    </Alert>
  )
}
