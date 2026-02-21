import { WorkItem, Entity, WorkItemStatus } from "@/lib/types/api"
import { WorkItemCard } from "./WorkItemCard"
import { Badge } from "@/components/ui/badge"

const COLUMNS: { status: WorkItemStatus; label: string }[] = [
  { status: "DRAFT", label: "Draft" },
  { status: "ACTIVE", label: "Active" },
  { status: "COMPLETED", label: "Completed" },
]

interface WorkItemKanbanProps {
  workItems: WorkItem[]
  entitiesMap: Map<string, Entity>
  workspaceId: string
}

export function WorkItemKanban({ workItems, entitiesMap, workspaceId }: WorkItemKanbanProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {COLUMNS.map(({ status, label }) => {
        const items = workItems.filter((wi) => wi.status === status)
        return (
          <div key={status} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{label}</p>
              <Badge variant="secondary">{items.length}</Badge>
            </div>
            {items.map((item) => (
              <WorkItemCard
                key={item.id}
                workItem={item}
                entityName={entitiesMap.get(item.entityId)?.name ?? "—"}
                workspaceId={workspaceId}
              />
            ))}
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed rounded-md">
                No items
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
