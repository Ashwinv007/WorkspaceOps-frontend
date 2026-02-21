"use client"

import { use, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchWorkItemTypes } from "@/lib/api/work-item-types"
import { WorkItemTypeCard } from "@/components/features/settings/work-item-types/WorkItemTypeCard"
import { CreateWorkItemTypeDialog } from "@/components/features/settings/work-item-types/CreateWorkItemTypeDialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ClipboardList, Plus } from "lucide-react"

export default function WorkItemTypesPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = use(params)
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["work-item-types", workspaceId],
    queryFn: () => fetchWorkItemTypes(workspaceId),
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Work Item Types</h1>
          {data && (
            <p className="text-muted-foreground mt-1">{data.count} type{data.count !== 1 ? "s" : ""}</p>
          )}
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Type
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : !data?.workItemTypes.length ? (
        <EmptyState
          icon={ClipboardList}
          title="No work item types"
          description="Create your first work item type to start tracking work."
          action={{ label: "Create Type", onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="space-y-3">
          {data.workItemTypes.map((wit) => (
            <WorkItemTypeCard key={wit.id} workItemType={wit} workspaceId={workspaceId} />
          ))}
        </div>
      )}

      <CreateWorkItemTypeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        workspaceId={workspaceId}
      />
    </div>
  )
}
