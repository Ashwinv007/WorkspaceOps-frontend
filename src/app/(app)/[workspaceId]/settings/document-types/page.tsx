"use client"

import { use, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchDocumentTypes } from "@/lib/api/document-types"
import { DocumentTypeCard } from "@/components/features/settings/document-types/DocumentTypeCard"
import { CreateDocumentTypeDialog } from "@/components/features/settings/document-types/CreateDocumentTypeDialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FileType, Plus } from "lucide-react"

export default function DocumentTypesPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = use(params)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: docTypes, isLoading } = useQuery({
    queryKey: ["document-types", workspaceId],
    queryFn: () => fetchDocumentTypes(workspaceId),
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Document Types</h1>
          {docTypes && (
            <p className="text-muted-foreground mt-1">{docTypes.length} type{docTypes.length !== 1 ? "s" : ""}</p>
          )}
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Type
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : !docTypes?.length ? (
        <EmptyState
          icon={FileType}
          title="No document types"
          description="Create your first document type to start uploading documents."
          action={{ label: "Create Type", onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="space-y-3">
          {docTypes.map((dt) => (
            <DocumentTypeCard key={dt.id} docType={dt} workspaceId={workspaceId} />
          ))}
        </div>
      )}

      <CreateDocumentTypeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        workspaceId={workspaceId}
      />
    </div>
  )
}
