import api from "./client"
import { Entity, EntityListResponse, Document, WorkItemListResponse } from "@/lib/types/api"

export async function fetchEntities(workspaceId: string, role?: string): Promise<EntityListResponse> {
  const params = role ? { role } : {}
  const res = await api.get(`/workspaces/${workspaceId}/entities`, { params })
  return res.data
}

export async function fetchEntityById(workspaceId: string, entityId: string): Promise<Entity> {
  const res = await api.get(`/workspaces/${workspaceId}/entities/${entityId}`)
  return res.data
}

export async function fetchEntityDocuments(workspaceId: string, entityId: string): Promise<Document[]> {
  const res = await api.get(`/workspaces/${workspaceId}/entities/${entityId}/documents`)
  return res.data
}

export async function fetchEntityWorkItems(workspaceId: string, entityId: string): Promise<WorkItemListResponse> {
  const res = await api.get(`/workspaces/${workspaceId}/entities/${entityId}/work-items`)
  return res.data
}

export async function createEntity(
  workspaceId: string,
  data: { name: string; role: string }
): Promise<Entity> {
  const res = await api.post(`/workspaces/${workspaceId}/entities`, data)
  return res.data
}

export async function updateEntity(
  workspaceId: string,
  entityId: string,
  data: { name?: string; role?: string }
): Promise<Entity> {
  const res = await api.put(`/workspaces/${workspaceId}/entities/${entityId}`, data)
  return res.data
}

export async function deleteEntity(workspaceId: string, entityId: string): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}/entities/${entityId}`)
}
