import api from "./client"
import { Document, DocumentListResponse } from "@/lib/types/api"

export async function fetchDocuments(
  workspaceId: string,
  filters?: {
    documentTypeId?: string
    entityId?: string
    expiryStatus?: string
    page?: number
    limit?: number
  }
): Promise<DocumentListResponse> {
  const res = await api.get(`/workspaces/${workspaceId}/documents`, { params: filters })
  return res.data
}

export async function fetchExpiringDocuments(workspaceId: string, days: number): Promise<Document[]> {
  const res = await api.get(`/workspaces/${workspaceId}/documents/expiring`, { params: { days } })
  return res.data.documents
}

export async function uploadDocument(workspaceId: string, formData: FormData): Promise<Document> {
  const res = await api.post(`/workspaces/${workspaceId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res.data
}

export async function updateDocument(
  workspaceId: string,
  docId: string,
  data: {
    entityId?: string | null
    expiryDate?: string | null
    metadata?: Record<string, string>
  }
): Promise<Document> {
  const res = await api.put(`/workspaces/${workspaceId}/documents/${docId}`, data)
  return res.data
}

export async function deleteDocument(workspaceId: string, docId: string): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}/documents/${docId}`)
}
