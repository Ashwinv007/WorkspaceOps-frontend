"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Download, Pencil, Trash2 } from "lucide-react"
import { Document, DocumentType, Entity } from "@/lib/types/api"
import { useWorkspaceRole } from "@/lib/hooks/useWorkspaceRole"
import { useDownloadDocument } from "@/lib/hooks/useDownloadDocument"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DocumentTableProps {
  documents: Document[]
  entitiesMap: Map<string, Entity>
  docTypesMap: Map<string, DocumentType>
  workspaceId: string
  onEdit?: (doc: Document) => void
  onDelete?: (doc: Document) => void
}

export function DocumentTable({
  documents,
  entitiesMap,
  docTypesMap,
  workspaceId,
  onEdit,
  onDelete,
}: DocumentTableProps) {
  const { isAdmin } = useWorkspaceRole()
  const { downloadDocument } = useDownloadDocument()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>File Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead>Uploaded</TableHead>
          <TableHead className="w-[120px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell>
              <button
                onClick={() => downloadDocument(doc.downloadUrl, doc.fileName)}
                className="font-medium hover:underline text-left"
              >
                {doc.fileName}
              </button>
            </TableCell>
            <TableCell className="text-sm">
              {docTypesMap.get(doc.documentTypeId)?.name ?? "—"}
            </TableCell>
            <TableCell className="text-sm">
              {doc.entityId ? (
                <Link
                  href={`/${workspaceId}/entities/${doc.entityId}`}
                  className="hover:underline"
                >
                  {entitiesMap.get(doc.entityId)?.name ?? "—"}
                </Link>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>
              <StatusBadge type="expiry" value={doc.expiryStatus} />
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {doc.expiryDate ? format(new Date(doc.expiryDate), "MMM d, yyyy") : "—"}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {format(new Date(doc.createdAt), "MMM d, yyyy")}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => downloadDocument(doc.downloadUrl, doc.fileName)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(doc)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {isAdmin && onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(doc)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
