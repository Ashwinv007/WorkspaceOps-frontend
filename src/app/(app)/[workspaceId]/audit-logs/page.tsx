"use client"

import { use, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchAuditLogs } from "@/lib/api/audit-logs"
import { AuditLogFilters, AuditLogFilterValues } from "@/components/features/audit-logs/AuditLogFilters"
import { AuditLogTable } from "@/components/features/audit-logs/AuditLogTable"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_LIMIT = 50

export default function AuditLogsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = use(params)
  const [filters, setFilters] = useState<AuditLogFilterValues>({})
  const [offset, setOffset] = useState(0)

  const queryFilters = { ...filters, limit: PAGE_LIMIT, offset }

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", workspaceId, queryFilters],
    queryFn: () => fetchAuditLogs(workspaceId, queryFilters),
  })

  function handleApplyFilters(newFilters: AuditLogFilterValues) {
    setFilters(newFilters)
    setOffset(0)
  }

  const total = data?.total ?? 0
  const from = total === 0 ? 0 : offset + 1
  const to = Math.min(offset + PAGE_LIMIT, total)
  const hasPrev = offset > 0
  const hasNext = offset + PAGE_LIMIT < total

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Track all actions in this workspace</p>
      </div>

      <AuditLogFilters onApply={handleApplyFilters} />

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : !data?.logs.length ? (
        <p className="text-sm text-muted-foreground text-center py-12">No audit logs found.</p>
      ) : (
        <>
          <AuditLogTable logs={data.logs} />

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {from}–{to} of {total} entries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrev}
                onClick={() => setOffset((o) => Math.max(0, o - PAGE_LIMIT))}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNext}
                onClick={() => setOffset((o) => o + PAGE_LIMIT)}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
