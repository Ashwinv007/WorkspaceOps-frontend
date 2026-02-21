"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchWorkItems, deleteWorkItem } from "@/lib/api/work-items"
import { fetchEntities } from "@/lib/api/entities"
import { fetchWorkItemTypes } from "@/lib/api/work-item-types"
import { WorkItem, Entity, WorkItemType } from "@/lib/types/api"
import { useWorkspaceRole } from "@/lib/hooks/useWorkspaceRole"
import { WorkItemKanban } from "@/components/features/work-items/WorkItemKanban"
import { WorkItemTable } from "@/components/features/work-items/WorkItemTable"
import { CreateWorkItemDialog } from "@/components/features/work-items/CreateWorkItemDialog"
import { EditWorkItemDialog } from "@/components/features/work-items/EditWorkItemDialog"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { LayoutGrid, List, Plus, ClipboardList } from "lucide-react"
import { toast } from "sonner"

export default function WorkItemsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = use(params)
  const queryClient = useQueryClient()
  const { isAdmin } = useWorkspaceRole()

  const [view, setView] = useState<"kanban" | "table">("kanban")
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [entityFilter, setEntityFilter] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<WorkItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WorkItem | null>(null)

  const filters = {
    ...(statusFilter && { status: statusFilter }),
    ...(priorityFilter && { priority: priorityFilter }),
    ...(typeFilter && { workItemTypeId: typeFilter }),
    ...(entityFilter && { entityId: entityFilter }),
  }

  const { data, isLoading } = useQuery({
    queryKey: ["work-items", workspaceId, filters],
    queryFn: () => fetchWorkItems(workspaceId, filters),
  })

  const { data: entitiesData } = useQuery({
    queryKey: ["entities", workspaceId],
    queryFn: () => fetchEntities(workspaceId),
  })

  const { data: typesData } = useQuery({
    queryKey: ["work-item-types", workspaceId],
    queryFn: () => fetchWorkItemTypes(workspaceId),
  })

  const entitiesMap = new Map<string, Entity>(
    entitiesData?.entities.map((e) => [e.id, e]) ?? []
  )
  const workItemTypesMap = new Map<string, WorkItemType>(
    typesData?.workItemTypes.map((t) => [t.id, t]) ?? []
  )

  const deleteMutation = useMutation({
    mutationFn: () => deleteWorkItem(workspaceId, deleteTarget!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-items", workspaceId] })
      toast.success("Work item deleted")
      setDeleteTarget(null)
    },
    onError: () => toast.error("Failed to delete work item"),
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Work Items</h1>
          {data && <p className="text-muted-foreground mt-1">{data.count} total</p>}
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Work Item
        </Button>
      </div>

      {/* Filters + View Toggle */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={statusFilter || "__all__"} onValueChange={(v) => setStatusFilter(v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter || "__all__"} onValueChange={(v) => setPriorityFilter(v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All priorities</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter || "__all__"} onValueChange={(v) => setTypeFilter(v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All types</SelectItem>
              {(typesData?.workItemTypes ?? []).map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={entityFilter || "__all__"} onValueChange={(v) => setEntityFilter(v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All entities</SelectItem>
              {(entitiesData?.entities ?? []).map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => { if (v) setView(v as "kanban" | "table") }}
        >
          <ToggleGroupItem value="kanban" aria-label="Kanban view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : !data?.workItems.length ? (
        <EmptyState
          icon={ClipboardList}
          title="No work items found"
          description="Create your first work item to get started."
          action={{ label: "New Work Item", onClick: () => setCreateOpen(true) }}
        />
      ) : view === "kanban" ? (
        <WorkItemKanban
          workItems={data.workItems}
          entitiesMap={entitiesMap}
          workspaceId={workspaceId}
        />
      ) : (
        <WorkItemTable
          workItems={data.workItems}
          entitiesMap={entitiesMap}
          workItemTypesMap={workItemTypesMap}
          workspaceId={workspaceId}
          onEdit={setEditItem}
          onDelete={isAdmin ? setDeleteTarget : undefined}
        />
      )}

      <CreateWorkItemDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        workspaceId={workspaceId}
        entities={entitiesData?.entities ?? []}
        workItemTypes={typesData?.workItemTypes ?? []}
      />

      {editItem && (
        <EditWorkItemDialog
          open={!!editItem}
          onOpenChange={(v) => { if (!v) setEditItem(null) }}
          workspaceId={workspaceId}
          workItem={editItem}
          entities={entitiesData?.entities ?? []}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}
        title="Delete Work Item"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
