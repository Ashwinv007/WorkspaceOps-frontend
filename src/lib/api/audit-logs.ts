import api from "./client"
import { AuditLog } from "@/lib/types/api"

interface AuditLogFilters {
  userId?: string
  action?: string
  targetType?: string
  from?: string
  to?: string
  limit?: number
  offset?: number
}

interface AuditLogResponse {
  total: number
  limit: number
  offset: number
  logs: AuditLog[]
}

export async function fetchAuditLogs(
  workspaceId: string,
  filters?: AuditLogFilters
): Promise<AuditLogResponse> {
  const res = await api.get(`/workspaces/${workspaceId}/audit-logs`, { params: filters })
  return res.data
}
