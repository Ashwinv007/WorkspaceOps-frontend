"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchEntities, deleteEntity } from "@/lib/api/entities"
import { Entity } from "@/lib/types/api"
import { useWorkspaceRole } from "@/lib/hooks/useWorkspaceRole"
import { EntityTable } from "@/components/features/entities/EntityTable"
import { CreateEntityDialog } from "@/components/features/entities/CreateEntityDialog"
import { EditEntityDialog } from "@/components/features/entities/EditEntityDialog"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users } from "lucide-react"
import { toast } from "sonner"

const ROLES = [
  { label: "All", value: "" },
  { label: "Customer", value: "CUSTOMER" },
  { label: "Employee", value: "EMPLOYEE" },
  { label: "Vendor", value: "VENDOR" },
  { label: "Self", value: "SELF" },
]

export default function EntitiesPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = use(params)
  const queryClient = useQueryClient()
  const { isAdmin, isMember } = useWorkspaceRole()

  const [roleFilter, setRoleFilter] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editEntity, setEditEntity] = useState<Entity | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Entity | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["entities", workspaceId, roleFilter],
    queryFn: () => fetchEntities(workspaceId, roleFilter || undefined),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteEntity(workspaceId, deleteTarget!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities", workspaceId] })
      toast.success("Entity deleted")
      setDeleteTarget(null)
    },
    onError: () => toast.error("Failed to delete entity"),
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Entities</h1>
          {data && (
            <p className="text-muted-foreground mt-1">{data.count} total</p>
          )}
        </div>
        {isMember && (
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Entity
          </Button>
        )}
      </div>

      <Tabs value={roleFilter} onValueChange={setRoleFilter}>
        <TabsList>
          {ROLES.map((r) => (
            <TabsTrigger key={r.value} value={r.value}>
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : !data?.entities.length ? (
        <EmptyState
          icon={Users}
          title="No entities found"
          description={roleFilter ? "Try a different filter." : "Create your first entity to get started."}
          action={isMember && !roleFilter ? { label: "Add Entity", onClick: () => setCreateOpen(true) } : undefined}
        />
      ) : (
        <EntityTable
          entities={data.entities}
          workspaceId={workspaceId}
          onEdit={setEditEntity}
          onDelete={setDeleteTarget}
        />
      )}

      <CreateEntityDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        workspaceId={workspaceId}
      />

      {editEntity && (
        <EditEntityDialog
          open={!!editEntity}
          onOpenChange={(v) => { if (!v) setEditEntity(null) }}
          workspaceId={workspaceId}
          entity={editEntity}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}
        title="Delete Entity"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
