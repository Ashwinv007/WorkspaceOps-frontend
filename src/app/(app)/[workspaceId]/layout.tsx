"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchWorkspaces } from "@/lib/api/workspaces"
import { WorkspaceProvider } from "@/context/WorkspaceContext"
import { SocketProvider } from "@/context/SocketProvider"
import { AppShell } from "@/components/layout/AppShell"
import { Skeleton } from "@/components/ui/skeleton"
import type { WorkspaceRole } from "@/lib/types/api"

export default function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = use(params)

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
  })

  const currentWorkspace = workspaces?.find((w) => w.id === workspaceId)
  const userRole = (currentWorkspace?.userRole ?? null) as WorkspaceRole | null
  const workspaceName = currentWorkspace?.name ?? "Workspace"

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  return (
    <WorkspaceProvider userRole={userRole}>
      <SocketProvider workspaceId={workspaceId}>
        <AppShell workspaceId={workspaceId} workspaceName={workspaceName}>
          {children}
        </AppShell>
      </SocketProvider>
    </WorkspaceProvider>
  )
}
