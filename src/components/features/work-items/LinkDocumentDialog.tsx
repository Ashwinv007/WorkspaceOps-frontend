"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchDocuments } from "@/lib/api/documents"
import { fetchDocumentTypes } from "@/lib/api/document-types"
import { linkDocument } from "@/lib/api/work-items"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Search } from "lucide-react"
import { toast } from "sonner"

interface LinkDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  workItemId: string
  alreadyLinkedIds: string[]
}

export function LinkDocumentDialog({
  open,
  onOpenChange,
  workspaceId,
  workItemId,
  alreadyLinkedIds,
}: LinkDocumentDialogProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [linkingId, setLinkingId] = useState<string | null>(null)

  const { data: docsData, isLoading } = useQuery({
    queryKey: ["documents", workspaceId],
    queryFn: () => fetchDocuments(workspaceId),
    enabled: open,
  })

  const { data: docTypes } = useQuery({
    queryKey: ["document-types", workspaceId],
    queryFn: () => fetchDocumentTypes(workspaceId),
    enabled: open,
  })

  const docTypesMap = new Map((docTypes ?? []).map((dt) => [dt.id, dt]))

  const mutation = useMutation({
    mutationFn: (documentId: string) => linkDocument(workspaceId, workItemId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-item-docs", workspaceId, workItemId] })
      queryClient.invalidateQueries({ queryKey: ["work-item", workspaceId, workItemId] })
      toast.success("Document linked")
      setLinkingId(null)
    },
    onError: () => {
      toast.error("Failed to link document")
      setLinkingId(null)
    },
  })

  const filtered = (docsData?.documents ?? []).filter(
    (doc) =>
      !alreadyLinkedIds.includes(doc.id) &&
      doc.fileName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Link Document</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="max-h-96 overflow-y-auto space-y-1">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : !filtered.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">No documents available to link.</p>
          ) : (
            filtered.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {docTypesMap.get(doc.documentTypeId)?.name ?? "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <StatusBadge type="expiry" value={doc.expiryStatus} />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={mutation.isPending && linkingId === doc.id}
                    onClick={() => {
                      setLinkingId(doc.id)
                      mutation.mutate(doc.id)
                    }}
                  >
                    {mutation.isPending && linkingId === doc.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Link"
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
