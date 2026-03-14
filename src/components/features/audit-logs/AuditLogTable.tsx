import { format } from "date-fns"
import { AuditLog } from "@/lib/types/api"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function getActionCategory(action: string): string {
  if (action.startsWith("USER_")) return "auth"
  if (action.startsWith("WORKSPACE_MEMBER")) return "workspace"
  if (action === "WORKSPACE_CREATED") return "workspace"
  if (action.startsWith("ENTITY_")) return "entity"
  if (action.startsWith("DOCUMENT_TYPE_")) return "documentType"
  if (action.startsWith("DOCUMENT_")) return "document"
  if (action.startsWith("WORK_ITEM_TYPE_")) return "workItemType"
  if (action.startsWith("WORK_ITEM_")) return "workItem"
  return "other"
}

function formatActionLabel(action: string): string {
  return action
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ")
}

const CATEGORY_CLASSES: Record<string, string> = {
  auth: "bg-secondary text-secondary-foreground",
  workspace: "border-blue-300 bg-blue-50 text-blue-800",
  entity: "border-green-300 bg-green-50 text-green-800",
  document: "border-amber-300 bg-amber-50 text-amber-800",
  documentType: "border-amber-300 bg-amber-50 text-amber-800",
  workItem: "border-purple-300 bg-purple-50 text-purple-800",
  workItemType: "border-purple-300 bg-purple-50 text-purple-800",
  other: "",
}

interface AuditLogTableProps {
  logs: AuditLog[]
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Target Type</TableHead>
          <TableHead>Target ID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => {
          const category = getActionCategory(log.action)
          return (
            <TableRow key={log.id}>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
              </TableCell>
              <TableCell className="text-sm">{log.userEmail ?? log.userId}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={CATEGORY_CLASSES[category] ?? ""}
                >
                  {formatActionLabel(log.action)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{log.targetType}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {log.targetId ?? "—"}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
