"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useWorkspaceRole } from "@/lib/hooks/useWorkspaceRole"
import { useAuth } from "@/context/AuthContext"
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  Settings,
  History,
  UserPlus,
  LayoutTemplate,
  Tag,
  ChevronsUpDown,
  ChevronDown,
  LogOut,
  UserCircle,
} from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  workspaceId: string
  workspaceName: string
}

export function Sidebar({ workspaceId, workspaceName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const { isAdmin } = useWorkspaceRole()
  const [settingsOpen, setSettingsOpen] = useState(false)

  function isActive(path: string) {
    return pathname.startsWith(path)
  }

  const navLink = (href: string, icon: React.ReactNode, label: string) => (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2",
          isActive(href) && "bg-accent font-medium"
        )}
      >
        {icon}
        {label}
      </Button>
    </Link>
  )

  return (
    <aside className="w-60 border-r flex flex-col h-full">
      {/* Workspace switcher */}
      <div className="p-4 border-b">
        <Button
          variant="ghost"
          className="w-full justify-between"
          onClick={() => router.push("/workspaces")}
        >
          <span className="font-semibold truncate">{workspaceName}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navLink(`/${workspaceId}/dashboard`, <LayoutDashboard className="h-4 w-4" />, "Dashboard")}
        {navLink(`/${workspaceId}/entities`, <Users className="h-4 w-4" />, "Entities")}
        {navLink(`/${workspaceId}/documents`, <FileText className="h-4 w-4" />, "Documents")}
        {navLink(`/${workspaceId}/work-items`, <CheckSquare className="h-4 w-4" />, "Work Items")}

        {isAdmin && (
          <>
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between gap-2",
                    isActive(`/${workspaceId}/settings`) && "bg-accent font-medium"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", settingsOpen && "rotate-180")}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 space-y-1 mt-1">
                {navLink(
                  `/${workspaceId}/settings/members`,
                  <UserPlus className="h-4 w-4" />,
                  "Members"
                )}
                {navLink(
                  `/${workspaceId}/settings/document-types`,
                  <LayoutTemplate className="h-4 w-4" />,
                  "Document Types"
                )}
                {navLink(
                  `/${workspaceId}/settings/work-item-types`,
                  <Tag className="h-4 w-4" />,
                  "Work Item Types"
                )}
              </CollapsibleContent>
            </Collapsible>

            {navLink(`/${workspaceId}/audit-logs`, <History className="h-4 w-4" />, "Audit Logs")}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t space-y-1">
        <div className="flex items-center gap-2 px-2 py-1">
          <UserCircle className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm truncate text-muted-foreground">My Account</span>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
