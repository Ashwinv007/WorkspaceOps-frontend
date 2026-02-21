// ─── Enums ────────────────────────────────────────────────────────────────────

export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
export type EntityRole = "SELF" | "CUSTOMER" | "EMPLOYEE" | "VENDOR"
export type FieldType = "text" | "date"
export type DocumentStatus = "VALID" | "EXPIRING" | "EXPIRED"
export type WorkItemStatus = "DRAFT" | "ACTIVE" | "COMPLETED"
export type WorkItemPriority = "LOW" | "MEDIUM" | "HIGH"

// ─── Core Models ──────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name?: string
  createdAt: string
  updatedAt: string
}

export interface Workspace {
  id: string
  tenantId: string
  name: string
  userRole: WorkspaceRole
  createdAt: string
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: WorkspaceRole
  createdAt: string
}

export interface Entity {
  id: string
  workspaceId: string
  name: string
  role: EntityRole
  createdAt: string
}

export interface DocumentTypeField {
  id: string
  documentTypeId: string
  fieldKey: string
  fieldType: FieldType
  isRequired: boolean
  isExpiryField: boolean
}

export interface DocumentType {
  id: string
  workspaceId: string
  name: string
  hasMetadata: boolean
  hasExpiry: boolean
  fields: DocumentTypeField[]
  createdAt: string
}

export interface Document {
  id: string
  workspaceId: string
  documentTypeId: string
  entityId?: string
  fileName: string
  fileUrl: string
  downloadUrl: string
  mimeType?: string
  fileSize: number
  metadata?: Record<string, string> | null
  expiryDate?: string
  expiryStatus: DocumentStatus
  uploadedBy: string
  createdAt: string
  // Only present in linked documents response
  linkedAt?: string
}

export interface WorkItemType {
  id: string
  workspaceId: string
  name: string
  description?: string
  entityType?: EntityRole
  createdAt: string
}

export interface WorkItem {
  id: string
  workspaceId: string
  workItemTypeId: string
  entityId: string
  assignedToUserId: string
  title: string
  description?: string
  status: WorkItemStatus
  priority?: WorkItemPriority
  dueDate?: string
  linkedDocumentIds: string[]
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  workspaceId: string
  userId: string
  action: string
  targetType: string
  targetId?: string
  createdAt: string
}

// ─── Overview ─────────────────────────────────────────────────────────────────

export interface OverviewDocumentType {
  id: string
  name: string
  hasMetadata: boolean
  hasExpiry: boolean
  fieldCount: number
}

export interface OverviewWorkItemType {
  id: string
  name: string
  entityType?: EntityRole
}

export interface WorkspaceOverview {
  workspaceId: string
  entities: {
    total: number
    byRole: Record<EntityRole, number>
  }
  documents: {
    total: number
    byStatus: Record<DocumentStatus, number>
  }
  workItems: {
    total: number
    byStatus: Record<WorkItemStatus, number>
  }
  documentTypes: OverviewDocumentType[]
  workItemTypes: OverviewWorkItemType[]
}

// ─── List Response Wrappers ────────────────────────────────────────────────────

export interface EntityListResponse {
  entities: Entity[]
  count: number
}

export interface DocumentListResponse {
  documents: Document[]
  count: number
}

export interface WorkItemListResponse {
  workItems: WorkItem[]
  count: number
}

export interface WorkItemTypeListResponse {
  workItemTypes: WorkItemType[]
  count: number
}

export interface MembersListResponse {
  members: WorkspaceMember[]
  count: number
}

export interface LinkedDocumentsResponse {
  linkedDocuments: Document[]
  count: number
}

export interface AuditLogListResponse {
  total: number
  limit: number
  offset: number
  logs: AuditLog[]
}

// ─── Auth Responses ───────────────────────────────────────────────────────────

export interface LoginResponse {
  success: boolean
  data: {
    userId: string
    token: string
  }
  message: string
}

export interface SignupResponse {
  success: boolean
  data: {
    userId: string
    workspaceId: string
    token: string
  }
  message: string
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateEntityDto {
  name: string
  role: EntityRole
}

export interface UpdateEntityDto {
  name?: string
  role?: EntityRole
}

export interface CreateDocumentTypeDto {
  name: string
  hasMetadata?: boolean
  hasExpiry?: boolean
  fields?: {
    fieldKey: string
    fieldType: FieldType
    isRequired?: boolean
    isExpiryField?: boolean
  }[]
}

export interface AddFieldDto {
  fieldKey: string
  fieldType: FieldType
  isRequired?: boolean
  isExpiryField?: boolean
}

export interface UpdateDocumentDto {
  entityId?: string
  expiryDate?: string
  metadata?: Record<string, string>
}

export interface CreateWorkItemDto {
  workItemTypeId: string
  entityId: string
  title: string
  description?: string
  priority?: WorkItemPriority
  dueDate?: string
}

export interface UpdateWorkItemDto {
  title?: string
  description?: string
  priority?: WorkItemPriority
  dueDate?: string
  entityId?: string
}

export interface CreateWorkItemTypeDto {
  name: string
  description?: string
  entityType?: EntityRole
}

export interface InviteMemberDto {
  invitedEmail: string
  role: WorkspaceRole
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface DocumentFilters {
  documentTypeId?: string
  entityId?: string
  expiryStatus?: DocumentStatus
}

export interface WorkItemFilters {
  status?: WorkItemStatus
  workItemTypeId?: string
  entityId?: string
  priority?: WorkItemPriority
}

export interface AuditLogFilters {
  userId?: string
  action?: string
  targetType?: string
  targetId?: string
  fromDate?: string
  toDate?: string
  limit?: number
  offset?: number
}
