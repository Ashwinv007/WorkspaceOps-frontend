"use client"

import { use, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchExpiringDocuments } from "@/lib/api/documents"
import { fetchEntities } from "@/lib/api/entities"
import { fetchDocumentTypes } from "@/lib/api/document-types"
import { Entity, DocumentType } from "@/lib/types/api"
import { DocumentTable } from "@/components/features/documents/DocumentTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FileText } from "lucide-react"

const DAY_OPTIONS = [7, 14, 30, 60, 90]

export default function ExpiringDocumentsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = use(params)
  const [days, setDays] = useState(30)

  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", "expiring", workspaceId, days],
    queryFn: () => fetchExpiringDocuments(workspaceId, days),
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

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Expiring Documents</h1>
        <p className="text-muted-foreground mt-1">Documents expiring within the selected window</p>
      </div>

      <ToggleGroup
        type="single"
        value={String(days)}
        onValueChange={(v) => { if (v) setDays(Number(v)) }}
        className="justify-start"
      >
        {DAY_OPTIONS.map((d) => (
          <ToggleGroupItem key={d} value={String(d)}>
            {d} days
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : !documents?.length ? (
        <EmptyState
          icon={FileText}
          title="No expiring documents"
          description={`No documents expiring within the next ${days} days.`}
        />
      ) : (
        <DocumentTable
          documents={documents}
          entitiesMap={entitiesMap}
          docTypesMap={docTypesMap}
          workspaceId={workspaceId}
        />
      )}
    </div>
  )
}
