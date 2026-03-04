"use client"

import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { useWorkspaceContext } from "@/context/WorkspaceContext"

interface TopBarProps {
  workspaceId: string
  workspaceName: string
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  entities: "Entities",
  documents: "Documents",
  expiring: "Expiring",
  "work-items": "Work Items",
  settings: "Settings",
  members: "Members",
  "document-types": "Document Types",
  "work-item-types": "Work Item Types",
  "audit-logs": "Audit Logs",
}

export function TopBar({ workspaceId, workspaceName }: TopBarProps) {
  const pathname = usePathname()
  const { userRole } = useWorkspaceContext()

  // Build breadcrumb segments from path (after workspaceId)
  const segments = pathname.split("/").filter(Boolean)
  const wsIndex = segments.indexOf(workspaceId)
  const pageSegments = wsIndex >= 0 ? segments.slice(wsIndex + 1) : []

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-6 shrink-0">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/workspaces">WorkspaceOps</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${workspaceId}/dashboard`}>{workspaceName}</BreadcrumbLink>
          </BreadcrumbItem>
          {pageSegments.map((seg, i) => {
            const isLast = i === pageSegments.length - 1
            const label = SEGMENT_LABELS[seg] ?? seg
            return (
              <span key={seg} className="flex items-center gap-1.5">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={`/${workspaceId}/${seg}`}>{label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {userRole && (
        <Badge variant="secondary" className="text-xs font-medium">
          {userRole}
        </Badge>
      )}
    </header>
  )
}
