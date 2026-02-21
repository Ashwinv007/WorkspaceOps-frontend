"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteWorkItemType } from "@/lib/api/work-item-types"
import { WorkItemType } from "@/lib/types/api"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

interface WorkItemTypeCardProps {
  workItemType: WorkItemType
  workspaceId: string
}

export function WorkItemTypeCard({ workItemType, workspaceId }: WorkItemTypeCardProps) {
  const queryClient = useQueryClient()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => deleteWorkItemType(workspaceId, workItemType.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-item-types", workspaceId] })
      toast.success("Work item type deleted")
      setDeleteOpen(false)
    },
    onError: () => toast.error("Failed to delete work item type"),
  })

  return (
    <>
      <Card>
        <CardContent className="py-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <p className="font-semibold">{workItemType.name}</p>
              {workItemType.entityType && (
                <Badge variant="outline" className="text-xs">{workItemType.entityType}</Badge>
              )}
            </div>
            {workItemType.description && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{workItemType.description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive ml-4"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Work Item Type"
        description={`Are you sure you want to delete "${workItemType.name}"?`}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
