import api from "./client"
import { WorkItem, WorkItemListResponse, LinkedDocumentsResponse } from "@/lib/types/api"

export async function fetchWorkItems(
  workspaceId: string,
  filters?: {
    status?: string
    priority?: string
    workItemTypeId?: string
    entityId?: string
  }
): Promise<WorkItemListResponse> {
  const res = await api.get(`/workspaces/${workspaceId}/work-items`, { params: filters })
  return res.data
}

export async function fetchWorkItem(workspaceId: string, itemId: string): Promise<WorkItem> {
  const res = await api.get(`/workspaces/${workspaceId}/work-items/${itemId}`)
  return res.data
}

export async function fetchWorkItemDocuments(
  workspaceId: string,
  itemId: string
): Promise<LinkedDocumentsResponse> {
  const res = await api.get(`/workspaces/${workspaceId}/work-items/${itemId}/documents`)
  return res.data
}

export async function createWorkItem(
  workspaceId: string,
  data: {
    workItemTypeId: string
    entityId: string
    title: string
    description?: string
    priority?: string
    dueDate?: string
  }
): Promise<WorkItem> {
  const res = await api.post(`/workspaces/${workspaceId}/work-items`, data)
  return res.data
}

export async function updateWorkItem(
  workspaceId: string,
  itemId: string,
  data: {
    title?: string
    description?: string
    priority?: string
    dueDate?: string | null
    entityId?: string
  }
): Promise<WorkItem> {
  const res = await api.put(`/workspaces/${workspaceId}/work-items/${itemId}`, data)
  return res.data
}

export async function updateStatus(
  workspaceId: string,
  itemId: string,
  status: string
): Promise<WorkItem> {
  const res = await api.patch(`/workspaces/${workspaceId}/work-items/${itemId}/status`, { status })
  return res.data
}

export async function linkDocument(
  workspaceId: string,
  itemId: string,
  documentId: string
): Promise<void> {
  await api.post(`/workspaces/${workspaceId}/work-items/${itemId}/documents`, { documentId })
}

export async function unlinkDocument(
  workspaceId: string,
  itemId: string,
  docId: string
): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}/work-items/${itemId}/documents/${docId}`)
}

export async function deleteWorkItem(workspaceId: string, itemId: string): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}/work-items/${itemId}`)
}
