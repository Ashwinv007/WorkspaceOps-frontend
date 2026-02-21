"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Pencil, Trash2 } from "lucide-react"
import { Entity } from "@/lib/types/api"
import { useWorkspaceRole } from "@/lib/hooks/useWorkspaceRole"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface EntityTableProps {
  entities: Entity[]
  workspaceId: string
  onEdit: (entity: Entity) => void
  onDelete: (entity: Entity) => void
}

export function EntityTable({ entities, workspaceId, onEdit, onDelete }: EntityTableProps) {
  const { isAdmin } = useWorkspaceRole()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entities.map((entity) => (
          <TableRow key={entity.id}>
            <TableCell>
              <Link
                href={`/${workspaceId}/entities/${entity.id}`}
                className="font-medium hover:underline"
              >
                {entity.name}
              </Link>
            </TableCell>
            <TableCell>
              <StatusBadge type="entityRole" value={entity.role} />
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {format(new Date(entity.createdAt), "MMM d, yyyy")}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(entity)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(entity)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
