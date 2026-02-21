import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"

interface AppShellProps {
  workspaceId: string
  workspaceName: string
  children: React.ReactNode
}

export function AppShell({ workspaceId, workspaceName, children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar workspaceId={workspaceId} workspaceName={workspaceName} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar workspaceId={workspaceId} workspaceName={workspaceName} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
