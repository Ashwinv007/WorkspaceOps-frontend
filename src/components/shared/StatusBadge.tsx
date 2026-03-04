import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type BadgeType = "expiry" | "workItemStatus" | "priority" | "role" | "entityRole"

interface StatusBadgeProps {
  type: BadgeType
  value: string
}

const colorMap: Record<string, string> = {
  // Expiry status
  VALID: "bg-success/15 text-success border-success/20 hover:bg-success/20",
  EXPIRING: "bg-warning/15 text-warning-foreground border-warning/20 hover:bg-warning/20",
  EXPIRED: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15",
  // Work item status
  ACTIVE: "bg-info/15 text-info border-info/20 hover:bg-info/20",
  COMPLETED: "bg-success/15 text-success border-success/20 hover:bg-success/20",
  // Priority
  HIGH: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15",
  MEDIUM: "bg-warning/15 text-warning-foreground border-warning/20 hover:bg-warning/20",
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
