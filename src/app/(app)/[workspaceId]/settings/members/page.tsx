"use client"

import { use, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchMembers } from "@/lib/api/workspaces"
import { MembersTable } from "@/components/features/settings/members/MembersTable"
import { InviteMemberDialog } from "@/components/features/settings/members/InviteMemberDialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserPlus } from "lucide-react"

export default function MembersPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = use(params)
  const [inviteOpen, setInviteOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => fetchMembers(workspaceId),
  })

  const currentUserId = typeof window !== "undefined"
    ? localStorage.getItem("workspaceops_userId") ?? ""
    : ""

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          {data && <p className="text-muted-foreground mt-1">{data.count} member{data.count !== 1 ? "s" : ""}</p>}
        </div>
        <Button onClick={() => setInviteOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : (
        <MembersTable
          members={data?.members ?? []}
          workspaceId={workspaceId}
          currentUserId={currentUserId}
        />
      )}

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        workspaceId={workspaceId}
      />
    </div>
  )
}
