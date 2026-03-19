import api from "./client"
import { AuditLogFilters, AuditLogListResponse } from "@/lib/types/api"

export async function fetchAuditLogs(
  workspaceId: string,
  filters?: AuditLogFilters
): Promise<AuditLogListResponse> {
  const res = await api.get(`/workspaces/${workspaceId}/audit-logs`, { params: filters })
  return res.data
}
