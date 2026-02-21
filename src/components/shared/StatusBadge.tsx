import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type BadgeType = "expiry" | "workItemStatus" | "priority" | "role" | "entityRole"

interface StatusBadgeProps {
  type: BadgeType
  value: string
}

const colorMap: Record<string, string> = {
  // Expiry status
  VALID: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
  EXPIRING: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
  EXPIRED: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  // Work item status
  ACTIVE: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
  COMPLETED: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
  // Priority
  HIGH: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  MEDIUM: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
}

const displayLabel: Record<string, string> = {
  VALID: "Valid",
  EXPIRING: "Expiring",
  EXPIRED: "Expired",
  DRAFT: "Draft",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
  SELF: "Self",
  CUSTOMER: "Customer",
  EMPLOYEE: "Employee",
  VENDOR: "Vendor",
}

export function StatusBadge({ type, value }: StatusBadgeProps) {
  const label = displayLabel[value] ?? value

  if (type === "role") {
    const variantMap: Record<string, "default" | "secondary" | "outline"> = {
      OWNER: "default",
      ADMIN: "secondary",
      MEMBER: "outline",
      VIEWER: "outline",
    }
    return <Badge variant={variantMap[value] ?? "outline"}>{label}</Badge>
  }

  if (type === "entityRole") {
    const variantMap: Record<string, "default" | "secondary" | "outline"> = {
      SELF: "default",
      CUSTOMER: "outline",
      EMPLOYEE: "outline",
      VENDOR: "secondary",
    }
    return <Badge variant={variantMap[value] ?? "outline"}>{label}</Badge>
  }

  if (type === "workItemStatus" && value === "DRAFT") {
    return <Badge variant="secondary">{label}</Badge>
  }

  if (type === "priority" && value === "LOW") {
    return <Badge variant="outline">{label}</Badge>
  }

  const colorClass = colorMap[value]
  if (colorClass) {
    return <Badge className={cn(colorClass)}>{label}</Badge>
  }

  return <Badge variant="outline">{label}</Badge>
}
