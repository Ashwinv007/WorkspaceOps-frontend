"use client"

import { useState } from "react"
import { format } from "date-fns"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateMemberRole, removeMember } from "@/lib/api/workspaces"
import { WorkspaceMember, WorkspaceRole } from "@/lib/types/api"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

interface MembersTableProps {
  members: WorkspaceMember[]
  workspaceId: string
  currentUserId: string
}

export function MembersTable({ members, workspaceId, currentUserId }: MembersTableProps) {
  const queryClient = useQueryClient()
  const [removeTarget, setRemoveTarget] = useState<WorkspaceMember | null>(null)

  const roleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: WorkspaceRole }) =>
      updateMemberRole(workspaceId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] })
      toast.success("Role updated")
    },
    onError: () => toast.error("Failed to update role"),
  })

  const removeMutation = useMutation({
    mutationFn: () => removeMember(workspaceId, removeTarget!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] })
      queryClient.invalidateQueries({ queryKey: ["workspaces"] })
      toast.success("Member removed")
      setRemoveTarget(null)
    },
    onError: () => toast.error("Failed to remove member"),
  })

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[60px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="text-sm font-medium">{member.userName ?? member.userEmail ?? member.userId}</div>
                {(member.userName || member.userEmail) && (
                  <div className="text-xs text-muted-foreground">{member.userEmail}</div>
                )}
              </TableCell>
              <TableCell>
                {member.role === "OWNER" ? (
                  <span className="text-sm font-medium">Owner</span>
                ) : (
                  <Select
                    value={member.role}
                    onValueChange={(v) =>
                      roleMutation.mutate({ memberId: member.id, role: v as WorkspaceRole })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(member.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                {member.role !== "OWNER" && member.userId !== currentUserId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setRemoveTarget(member)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(v) => { if (!v) setRemoveTarget(null) }}
        title="Remove Member"
        description="Are you sure you want to remove this member from the workspace?"
        onConfirm={() => removeMutation.mutate()}
        loading={removeMutation.isPending}
      />
    </>
  )
}
