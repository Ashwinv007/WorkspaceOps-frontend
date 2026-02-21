import api from "./client"
import { DocumentType, DocumentTypeField } from "@/lib/types/api"

export async function fetchDocumentTypes(workspaceId: string): Promise<DocumentType[]> {
  const res = await api.get(`/workspaces/${workspaceId}/document-types`)
  return res.data.data
}

export async function createDocumentType(
  workspaceId: string,
  data: {
    name: string
    hasMetadata: boolean
    hasExpiry: boolean
    fields?: Array<{
      fieldKey: string
      fieldType: "text" | "date"
      isRequired: boolean
      isExpiryField: boolean
    }>
  }
): Promise<DocumentType> {
  const res = await api.post(`/workspaces/${workspaceId}/document-types`, data)
  return res.data.data
}

export async function addField(
  workspaceId: string,
  typeId: string,
  data: {
    fieldKey: string
    fieldType: "text" | "date"
    isRequired: boolean
    isExpiryField: boolean
  }
): Promise<DocumentTypeField> {
  const res = await api.post(`/workspaces/${workspaceId}/document-types/${typeId}/fields`, data)
  return res.data
}

export async function deleteDocumentType(workspaceId: string, typeId: string): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}/document-types/${typeId}`)
}
