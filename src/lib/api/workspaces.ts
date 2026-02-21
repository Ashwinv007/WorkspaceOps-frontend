import api from "./client"
import type { Workspace, MembersListResponse, WorkspaceMember, WorkspaceRole } from "@/lib/types/api"

export async function fetchWorkspaces(): Promise<Workspace[]> {
  const res = await api.get("/workspaces")
  return res.data.data
}

export async function createWorkspace(tenantId: string, name: string): Promise<Workspace> {
  const res = await api.post("/workspaces", { tenantId, name })
  return res.data
}

export async function fetchMembers(workspaceId: string): Promise<MembersListResponse> {
  const res = await api.get(`/workspaces/${workspaceId}/members`)
  return res.data
}

export async function inviteMember(
  workspaceId: string,
  invitedEmail: string,
  role: WorkspaceRole
): Promise<WorkspaceMember> {
  const res = await api.post(`/workspaces/${workspaceId}/members`, { invitedEmail, role })
  return res.data
}

export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  role: WorkspaceRole
): Promise<WorkspaceMember> {
  const res = await api.put(`/workspaces/${workspaceId}/members/${memberId}`, { role })
  return res.data
}

export async function removeMember(workspaceId: string, memberId: string): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}/members/${memberId}`)
}
