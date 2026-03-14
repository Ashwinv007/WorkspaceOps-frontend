"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useWorkspaceRole } from "@/lib/hooks/useWorkspaceRole"
import { useAuth } from "@/context/AuthContext"
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  History,
  UserPlus,
  LayoutTemplate,
  Tag,
  Building2,
  ChevronsUpDown,
  LogOut,
} from "lucide-react"

interface SidebarProps {
  workspaceId: string
  workspaceName: string
}

export function Sidebar({ workspaceId, workspaceName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const { isAdmin } = useWorkspaceRole()

  function isActive(path: string) {
    return pathname.startsWith(path)
  }

  const navLink = (href: string, icon: React.ReactNode, label: string) => (
    <div className="relative">
      {isActive(href) && (
        <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r bg-primary" />
      )}
      <Link href={href}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 pl-3",
            isActive(href) && "bg-accent/70 font-medium"
          )}
        >
          {icon}
          {label}
        </Button>
      </Link>
    </div>
  )

  return (
    <aside className="w-60 border-r bg-sidebar flex flex-col h-full">
      {/* Workspace switcher */}
      <div className="p-3 border-b">
        <Button
          variant="ghost"
          className="w-full justify-between gap-2 px-3"
          onClick={() => router.push("/workspaces")}
        >
          <span className="flex items-center gap-2 min-w-0">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="font-semibold truncate">{workspaceName}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <p className="px-3 pb-1 pt-2 section-label">
          Workspace
        </p>
        <div className="space-y-0.5">
          {navLink(`/${workspaceId}/dashboard`, <LayoutDashboard className="h-4 w-4" />, "Dashboard")}
          {navLink(`/${workspaceId}/entities`, <Users className="h-4 w-4" />, "Entities")}
          {navLink(`/${workspaceId}/documents`, <FileText className="h-4 w-4" />, "Documents")}
          {navLink(`/${workspaceId}/work-items`, <CheckSquare className="h-4 w-4" />, "Work Items")}
        </div>

        {isAdmin && (
          <>
            <p className="px-3 pb-1 pt-4 section-label">
              Admin
            </p>
            <div className="space-y-0.5">
              {navLink(`/${workspaceId}/settings/members`, <UserPlus className="h-4 w-4" />, "Members")}
              {navLink(`/${workspaceId}/settings/document-types`, <LayoutTemplate className="h-4 w-4" />, "Document Types")}
              {navLink(`/${workspaceId}/settings/work-item-types`, <Tag className="h-4 w-4" />, "Work Item Types")}
              {navLink(`/${workspaceId}/audit-logs`, <History className="h-4 w-4" />, "Audit Logs")}
            </div>
          </>
        )}
      </nav>

      {/* User section */}
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
