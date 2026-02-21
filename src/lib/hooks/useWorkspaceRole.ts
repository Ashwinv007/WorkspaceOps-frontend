import { useWorkspaceContext } from "@/context/WorkspaceContext"

export function useWorkspaceRole() {
  const { userRole } = useWorkspaceContext()
  return {
    userRole,
    isAdmin: userRole === "ADMIN" || userRole === "OWNER",
    isOwner: userRole === "OWNER",
    isMember: userRole === "MEMBER" || userRole === "ADMIN" || userRole === "OWNER",
  }
}
