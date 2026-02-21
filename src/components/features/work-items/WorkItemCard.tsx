"use client"

import Link from "next/link"
import { format } from "date-fns"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateStatus } from "@/lib/api/work-items"
import { WorkItem } from "@/lib/types/api"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"
import { toast } from "sonner"

interface WorkItemCardProps {
  workItem: WorkItem
  entityName: string
  workspaceId: string
}

export function WorkItemCard({ workItem, entityName, workspaceId }: WorkItemCardProps) {
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
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/${workspaceId}/work-items/${workItem.id}`}
            className="font-medium hover:underline leading-tight"
          >
            {workItem.title}
          </Link>
          {workItem.priority && (
            <StatusBadge type="priority" value={workItem.priority} />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <p className="text-sm text-muted-foreground">{entityName}</p>
        {workItem.dueDate && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {format(new Date(workItem.dueDate), "MMM d, yyyy")}
          </div>
        )}
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
            Start →
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
              Unstart
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate("COMPLETED")}
            >
              Complete ✓
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
      </CardFooter>
    </Card>
  )
}
