"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchWorkItem, fetchWorkItemDocuments, updateStatus, unlinkDocument, deleteWorkItem } from "@/lib/api/work-items"
import { fetchDocumentTypes } from "@/lib/api/document-types"
import { fetchEntities } from "@/lib/api/entities"
import { fetchWorkItemTypes } from "@/lib/api/work-item-types"
import { useWorkspaceRole } from "@/lib/hooks/useWorkspaceRole"
import { useDownloadDocument } from "@/lib/hooks/useDownloadDocument"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EditWorkItemDialog } from "@/components/features/work-items/EditWorkItemDialog"
import { LinkDocumentDialog } from "@/components/features/work-items/LinkDocumentDialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { ArrowLeft, Download, Link2Off, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function WorkItemDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string; itemId: string }>
}) {
  const { workspaceId, itemId } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAdmin } = useWorkspaceRole()
  const { downloadDocument } = useDownloadDocument()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [unlinkTargetId, setUnlinkTargetId] = useState<string | null>(null)

  const { data: workItem, isLoading } = useQuery({
    queryKey: ["work-item", workspaceId, itemId],
    queryFn: () => fetchWorkItem(workspaceId, itemId),
  })

  const { data: linkedDocsData } = useQuery({
    queryKey: ["work-item-docs", workspaceId, itemId],
    queryFn: () => fetchWorkItemDocuments(workspaceId, itemId),
    enabled: !!workItem,
  })

  const { data: docTypes } = useQuery({
    queryKey: ["document-types", workspaceId],
    queryFn: () => fetchDocumentTypes(workspaceId),
  })

  const { data: entitiesData } = useQuery({
    queryKey: ["entities", workspaceId],
    queryFn: () => fetchEntities(workspaceId),
  })

  const { data: workItemTypesData } = useQuery({
    queryKey: ["work-item-types", workspaceId],
    queryFn: () => fetchWorkItemTypes(workspaceId),
  })

  const docTypesMap = new Map((docTypes ?? []).map((dt) => [dt.id, dt]))
  const entitiesMap = new Map((entitiesData?.entities ?? []).map((e) => [e.id, e]))
  const workItemTypesMap = new Map((workItemTypesData?.workItemTypes ?? []).map((t) => [t.id, t]))

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateStatus(workspaceId, itemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-item", workspaceId, itemId] })
      toast.success("Status updated")
    },
    onError: (err: { response?: { status: number } }) => {
      if (err?.response?.status === 409) {
        toast.error("Status changed by another user — refreshing")
        queryClient.invalidateQueries({ queryKey: ["work-item", workspaceId, itemId] })
      } else {
        toast.error("Failed to update status")
      }
    },
  })

  const unlinkMutation = useMutation({
    mutationFn: (docId: string) => unlinkDocument(workspaceId, itemId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-item-docs", workspaceId, itemId] })
      queryClient.invalidateQueries({ queryKey: ["work-item", workspaceId, itemId] })
      toast.success("Document unlinked")
      setUnlinkTargetId(null)
    },
    onError: () => {
      toast.error("Failed to unlink document")
      setUnlinkTargetId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteWorkItem(workspaceId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-items", workspaceId] })
      toast.success("Work item deleted")
      router.push(`/${workspaceId}/work-items`)
    },
    onError: () => toast.error("Failed to delete work item"),
  })

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!workItem) return null

  const linkedDocs = linkedDocsData?.linkedDocuments ?? []
  const entityName = entitiesMap.get(workItem.entityId)?.name ?? workItem.entityId
  const typeName = workItemTypesMap.get(workItem.workItemTypeId)?.name ?? workItem.workItemTypeId

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      {/* Back */}
      <Link
        href={`/${workspaceId}/work-items`}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Work Items
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{workItem.title}</h1>
            <Badge variant="outline">{workItem.status}</Badge>
            {workItem.priority && <StatusBadge type="priority" value={workItem.priority} />}
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Status Action Bar */}
      <div className="flex items-center gap-2">
        {workItem.status === "DRAFT" && (
          <Button
            onClick={() => statusMutation.mutate("ACTIVE")}
            disabled={statusMutation.isPending}
          >
            {statusMutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Start Work Item →
          </Button>
        )}
        {workItem.status === "ACTIVE" && (
          <>
            <Button
              style={{ backgroundColor: "rgb(22 163 74)", color: "white" }}
              onClick={() => statusMutation.mutate("COMPLETED")}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Mark as Complete ✓
            </Button>
            <Button
              variant="ghost"
              onClick={() => statusMutation.mutate("DRAFT")}
              disabled={statusMutation.isPending}
            >
              Move back to Draft
            </Button>
          </>
        )}
        {workItem.status === "COMPLETED" && (
          <Button
            variant="outline"
            onClick={() => statusMutation.mutate("ACTIVE")}
            disabled={statusMutation.isPending}
          >
            {statusMutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Reopen Work Item
          </Button>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Entity</p>
          <Link
            href={`/${workspaceId}/entities/${workItem.entityId}`}
            className="font-medium hover:underline"
          >
            {entityName}
          </Link>
        </div>
        <div>
          <p className="text-muted-foreground">Work Item Type</p>
          <p className="font-medium">{typeName}</p>
        </div>
        {workItem.dueDate && (
          <div>
            <p className="text-muted-foreground">Due Date</p>
            <p className="font-medium">{format(new Date(workItem.dueDate), "MMM d, yyyy")}</p>
          </div>
        )}
        <div>
          <p className="text-muted-foreground">Assigned To</p>
          <p className="font-medium">{workItem.assignedToUserName ?? workItem.assignedToUserEmail ?? workItem.assignedToUserId}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Created</p>
          <p className="font-medium">{format(new Date(workItem.createdAt), "MMM d, yyyy")}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Last Updated</p>
          <p className="font-medium">{format(new Date(workItem.updatedAt), "MMM d, yyyy")}</p>
        </div>
      </div>

      {/* Description */}
      {workItem.description && (
        <>
          <Separator />
          <div>
            <p className="text-sm font-medium mb-2">Description</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{workItem.description}</p>
          </div>
        </>
      )}

      {/* Linked Documents */}
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold">
            Linked Documents {linkedDocs.length > 0 && `(${linkedDocs.length})`}
          </p>
          <Button size="sm" variant="outline" onClick={() => setLinkOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Link Document
          </Button>
        </div>

        {linkedDocs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No linked documents.</p>
        ) : (
          <div className="space-y-2">
            {linkedDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-md border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {docTypesMap.get(doc.documentTypeId)?.name ?? "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <StatusBadge type="expiry" value={doc.expiryStatus} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => downloadDocument(doc.downloadUrl, doc.fileName)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setUnlinkTargetId(doc.id)}
                  >
                    <Link2Off className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {entitiesData && (
        <EditWorkItemDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          workspaceId={workspaceId}
          workItem={workItem}
          entities={entitiesData.entities}
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Work Item"
        description={`Are you sure you want to delete "${workItem.title}"? This action cannot be undone.`}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
      />

      <LinkDocumentDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        workspaceId={workspaceId}
        workItemId={itemId}
        alreadyLinkedIds={workItem.linkedDocumentIds}
      />

      <ConfirmDialog
        open={!!unlinkTargetId}
        onOpenChange={(v) => { if (!v) setUnlinkTargetId(null) }}
        title="Unlink Document"
        description="Are you sure you want to unlink this document from the work item?"
        onConfirm={() => unlinkMutation.mutate(unlinkTargetId!)}
        loading={unlinkMutation.isPending}
      />
    </div>
  )
}
