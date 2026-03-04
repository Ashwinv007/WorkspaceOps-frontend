import { WorkspaceOverview } from "@/lib/types/api"
import { StatCard } from "@/components/shared/StatCard"

interface OverviewStatCardsProps {
  overview: WorkspaceOverview
}

export function OverviewStatCards({ overview }: OverviewStatCardsProps) {
  const entityBreakdown = Object.entries(overview.entities.byRole).map(([label, value]) => ({
    label,
    value,
    colorClass: "bg-muted-foreground/30",
  }))

  const documentBreakdown = [
    { label: "Valid", value: overview.documents.byStatus.VALID, colorClass: "bg-success" },
    { label: "Expiring", value: overview.documents.byStatus.EXPIRING, colorClass: "bg-warning" },
    { label: "Expired", value: overview.documents.byStatus.EXPIRED, colorClass: "bg-destructive" },
  ]

  const workItemBreakdown = [
    { label: "Draft", value: overview.workItems.byStatus.DRAFT, colorClass: "bg-muted-foreground/30" },
    { label: "Active", value: overview.workItems.byStatus.ACTIVE, colorClass: "bg-info" },
    { label: "Completed", value: overview.workItems.byStatus.COMPLETED, colorClass: "bg-success" },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        title="Entities"
        total={overview.entities.total}
        breakdown={entityBreakdown}
      />
      <StatCard
        title="Documents"
        total={overview.documents.total}
        breakdown={documentBreakdown}
      />
      <StatCard
        title="Work Items"
        total={overview.workItems.total}
        breakdown={workItemBreakdown}
      />
    </div>
  )
}
