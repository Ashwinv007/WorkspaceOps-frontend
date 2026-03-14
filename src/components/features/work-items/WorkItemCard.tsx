"use client"

import Link from "next/link"
import { format } from "date-fns"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateStatus } from "@/lib/api/work-items"
import { WorkItem } from "@/lib/types/api"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { CalendarDays, Check, Pencil, Trash2, User2 } from "lucide-react"
import { toast } from "sonner"

interface WorkItemCardProps {
  workItem: WorkItem
  entityName: string
  typeName?: string
  workspaceId: string
  isAdmin?: boolean
  onEdit?: (item: WorkItem) => void
  onDelete?: (item: WorkItem) => void
}

export function WorkItemCard({
  workItem,
  entityName,
  typeName,
  workspaceId,
  isAdmin,
  onEdit,
  onDelete,
}: WorkItemCardProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (status: string) => updateStatus(workspaceId, workItem.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-items", workspaceId] })
    },
    onError: (err: { response?: { status: number } }) => {
      if (err?.response?.status === 409) {
        toast.error("Status changed by another user — refreshing")
        queryClient.invalidateQueries({ queryKey: ["work-items", workspaceId] })
      } else {
        toast.error("Failed to update status")
      }
    },
  })

  return (
    <Card className="flex flex-col hover:shadow-sm transition-shadow duration-150">
      <CardHeader className="pb-2">
        {workItem.priority && (
          <div className="mb-1">
            <StatusBadge type="priority" value={workItem.priority} />
          </div>
        )}
        <Link
          href={`/${workspaceId}/work-items/${workItem.id}`}
          className="font-medium hover:underline leading-tight cursor-pointer"
        >
          {workItem.title}
        </Link>
        {typeName && (
          <p className="text-xs text-muted-foreground">{typeName}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-2 space-y-1">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <User2 className="h-3.5 w-3.5 shrink-0" />
          <span>{entityName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 shrink-0" />
          {workItem.dueDate ? format(new Date(workItem.dueDate), "MMM d, yyyy") : "—"}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex gap-2">
        {workItem.status === "DRAFT" && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate("ACTIVE")}
          >
            Start
          </Button>
        )}
        {workItem.status === "ACTIVE" && (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate("DRAFT")}
            >
              To Draft
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate("COMPLETED")}
            >
              <Check className="h-3.5 w-3.5" />
              Complete
            </Button>
          </>
        )}
        {workItem.status === "COMPLETED" && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate("ACTIVE")}
          >
            Reopen
          </Button>
        )}
        {(onEdit || (isAdmin && onDelete)) && (
          <div className="flex gap-1 ml-auto">
            {onEdit && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onEdit(workItem)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {isAdmin && onDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(workItem)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
