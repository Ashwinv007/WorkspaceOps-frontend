import { WorkspaceOverview } from "@/lib/types/api"
import { StatCard } from "@/components/shared/StatCard"

interface OverviewStatCardsProps {
  overview: WorkspaceOverview
}

export function OverviewStatCards({ overview }: OverviewStatCardsProps) {
  const entityBreakdown = Object.entries(overview.entities.byRole).map(([label, value]) => ({
    label,
    value,
  }))

  const documentBreakdown = [
    { label: "Valid", value: overview.documents.byStatus.VALID, color: "#16a34a" },
    { label: "Expiring", value: overview.documents.byStatus.EXPIRING, color: "#d97706" },
    { label: "Expired", value: overview.documents.byStatus.EXPIRED, color: "#dc2626" },
  ]

  const workItemBreakdown = [
    { label: "Draft", value: overview.workItems.byStatus.DRAFT },
    { label: "Active", value: overview.workItems.byStatus.ACTIVE, color: "#2563eb" },
    { label: "Completed", value: overview.workItems.byStatus.COMPLETED, color: "#16a34a" },
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
