"use client"

import { use, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchDocuments, deleteDocument } from "@/lib/api/documents"
import { fetchEntities } from "@/lib/api/entities"
import { fetchDocumentTypes } from "@/lib/api/document-types"
import { Document, Entity, DocumentType } from "@/lib/types/api"
import { useWorkspaceRole } from "@/lib/hooks/useWorkspaceRole"
import { DocumentTable } from "@/components/features/documents/DocumentTable"
import { UploadDocumentDialog } from "@/components/features/documents/UploadDocumentDialog"
import { EditDocumentDialog } from "@/components/features/documents/EditDocumentDialog"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Plus } from "lucide-react"
import { toast } from "sonner"

export default function DocumentsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = use(params)
  const queryClient = useQueryClient()
  const { isAdmin } = useWorkspaceRole()
  const searchParams = useSearchParams()

  const [statusFilter, setStatusFilter] = useState(() => {
    const s = searchParams.get("expiryStatus")
    return s === "EXPIRING" || s === "EXPIRED" || s === "VALID" ? s : ""
  })
  const [docTypeFilter, setDocTypeFilter] = useState("")
  const [entityFilter, setEntityFilter] = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [editDoc, setEditDoc] = useState<Document | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null)

  const filters = {
    ...(statusFilter && { expiryStatus: statusFilter }),
    ...(docTypeFilter && { documentTypeId: docTypeFilter }),
    ...(entityFilter && { entityId: entityFilter }),
  }

  const { data, isLoading } = useQuery({
    queryKey: ["documents", workspaceId, filters],
    queryFn: () => fetchDocuments(workspaceId, filters),
  })

  const { data: entitiesData } = useQuery({
    queryKey: ["entities", workspaceId],
    queryFn: () => fetchEntities(workspaceId),
  })

  const { data: docTypes } = useQuery({
    queryKey: ["document-types", workspaceId],
    queryFn: () => fetchDocumentTypes(workspaceId),
  })

  const entitiesMap = new Map<string, Entity>(
    entitiesData?.entities.map((e) => [e.id, e]) ?? []
  )
  const docTypesMap = new Map<string, DocumentType>(
    (docTypes ?? []).map((dt) => [dt.id, dt])
  )

  const deleteMutation = useMutation({
    mutationFn: () => deleteDocument(workspaceId, deleteTarget!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", workspaceId] })
      toast.success("Document deleted")
      setDeleteTarget(null)
    },
    onError: () => toast.error("Failed to delete document"),
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          {data && <p className="text-muted-foreground mt-1">{data.count} total</p>}
        </div>
        <Button onClick={() => setUploadOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="">All</TabsTrigger>
            <TabsTrigger value="VALID">Valid</TabsTrigger>
            <TabsTrigger value="EXPIRING">Expiring</TabsTrigger>
            <TabsTrigger value="EXPIRED">Expired</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={docTypeFilter || "__all__"} onValueChange={(v) => setDocTypeFilter(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All types</SelectItem>
            {(docTypes ?? []).map((dt) => (
              <SelectItem key={dt.id} value={dt.id}>{dt.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={entityFilter || "__all__"} onValueChange={(v) => setEntityFilter(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All entities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All entities</SelectItem>
            {(entitiesData?.entities ?? []).map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : !data?.documents.length ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description="Upload your first document to get started."
          action={{ label: "Upload Document", onClick: () => setUploadOpen(true) }}
        />
      ) : (
        <DocumentTable
          documents={data.documents}
          entitiesMap={entitiesMap}
          docTypesMap={docTypesMap}
          workspaceId={workspaceId}
          onEdit={setEditDoc}
          onDelete={setDeleteTarget}
        />
      )}

      <UploadDocumentDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        workspaceId={workspaceId}
        documentTypes={docTypes ?? []}
        entities={entitiesData?.entities ?? []}
      />

      {editDoc && (
        <EditDocumentDialog
          open={!!editDoc}
          onOpenChange={(v) => { if (!v) setEditDoc(null) }}
          workspaceId={workspaceId}
          document={editDoc}
          documentType={docTypesMap.get(editDoc.documentTypeId)}
          entities={entitiesData?.entities ?? []}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}
        title="Delete Document"
        description={`Are you sure you want to delete "${deleteTarget?.fileName}"? This action cannot be undone.`}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
