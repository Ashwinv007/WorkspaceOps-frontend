import api from "./client"
import { WorkItemType, WorkItemTypeListResponse } from "@/lib/types/api"

export async function fetchWorkItemTypes(workspaceId: string): Promise<WorkItemTypeListResponse> {
  const res = await api.get(`/workspaces/${workspaceId}/work-item-types`)
  return res.data
}

export async function createWorkItemType(
  workspaceId: string,
  data: { name: string; description?: string; entityType?: string }
): Promise<WorkItemType> {
  const res = await api.post(`/workspaces/${workspaceId}/work-item-types`, data)
  return res.data
}

export async function deleteWorkItemType(workspaceId: string, typeId: string): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}/work-item-types/${typeId}`)
}
