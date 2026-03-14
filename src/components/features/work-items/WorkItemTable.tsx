"use client"

import Link from "next/link"
import { format } from "date-fns"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateStatus } from "@/lib/api/work-items"
import { Pencil, Trash2 } from "lucide-react"
import { WorkItem, Entity, WorkItemType } from "@/lib/types/api"
import { useWorkspaceRole } from "@/lib/hooks/useWorkspaceRole"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

interface WorkItemTableProps {
  workItems: WorkItem[]
  entitiesMap: Map<string, Entity>
  workItemTypesMap: Map<string, WorkItemType>
  workspaceId: string
  onEdit?: (item: WorkItem) => void
  onDelete?: (item: WorkItem) => void
}

interface RowProps {
  item: WorkItem
  entitiesMap: Map<string, Entity>
  workItemTypesMap: Map<string, WorkItemType>
  workspaceId: string
  isAdmin: boolean
  onEdit?: (item: WorkItem) => void
  onDelete?: (item: WorkItem) => void
}

function WorkItemRow({
  item,
  entitiesMap,
  workItemTypesMap,
  workspaceId,
  isAdmin,
  onEdit,
  onDelete,
}: RowProps) {
  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateStatus(workspaceId, item.id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["work-items", workspaceId] }),
    onError: () => toast.error("Failed to update status"),
  })

  const STATUS_OPTIONS = ["DRAFT", "ACTIVE", "COMPLETED"].filter((s) => s !== item.status)

  return (
    <TableRow className="hover:bg-muted/40 transition-colors duration-100">
      <TableCell>
        <Link
          href={`/${workspaceId}/work-items/${item.id}`}
          className="font-medium hover:underline cursor-pointer"
        >
          {item.title}
        </Link>
      </TableCell>
      <TableCell className="text-sm">
        {workItemTypesMap.get(item.workItemTypeId)?.name ?? "—"}
      </TableCell>
      <TableCell className="text-sm">
        {entitiesMap.get(item.entityId)?.name ?? "—"}
      </TableCell>
      <TableCell>
        {item.priority ? (
          <StatusBadge type="priority" value={item.priority} />
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {STATUS_OPTIONS.map((s) => (
              <DropdownMenuItem
                key={s}
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate(s)}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {item.dueDate ? format(new Date(item.dueDate), "MMM d, yyyy") : "—"}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => onEdit(item)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {isAdmin && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive hover:text-destructive"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

export function WorkItemTable({
  workItems,
  entitiesMap,
  workItemTypesMap,
  workspaceId,
  onEdit,
  onDelete,
}: WorkItemTableProps) {
  const { isAdmin } = useWorkspaceRole()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workItems.map((item) => (
          <WorkItemRow
            key={item.id}
            item={item}
            entitiesMap={entitiesMap}
            workItemTypesMap={workItemTypesMap}
            workspaceId={workspaceId}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  )
}
