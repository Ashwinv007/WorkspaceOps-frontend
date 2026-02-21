import api from "./client"
import { WorkspaceOverview } from "@/lib/types/api"

export async function fetchOverview(workspaceId: string): Promise<WorkspaceOverview> {
  const res = await api.get(`/workspaces/${workspaceId}/overview`)
  return res.data
}
