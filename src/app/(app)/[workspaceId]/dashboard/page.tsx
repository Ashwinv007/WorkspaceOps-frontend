"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchOverview } from "@/lib/api/overview"
import { OverviewStatCards } from "@/components/features/dashboard/OverviewStatCards"
import { AlertBanner } from "@/components/features/dashboard/AlertBanner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function DashboardPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = use(params)

  const { data: overview, isLoading } = useQuery({
    queryKey: ["overview", workspaceId],
    queryFn: () => fetchOverview(workspaceId),
  })

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
        <Skeleton className="h-14" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
        </div>
      </div>
    )
  }

  if (!overview) return null

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Workspace overview</p>
      </div>

      <OverviewStatCards overview={overview} />

      <AlertBanner
        expiring={overview.documents.byStatus.EXPIRING}
        expired={overview.documents.byStatus.EXPIRED}
        workspaceId={workspaceId}
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Document Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Document Types</CardTitle>
          </CardHeader>
          <CardContent>
            {overview.documentTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No document types configured.</p>
            ) : (
              <div className="space-y-2">
                {overview.documentTypes.map((dt) => (
                  <div key={dt.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{dt.name}</span>
                    <div className="flex items-center gap-1.5">
                      {dt.hasExpiry && (
                        <Badge variant="outline" className="text-xs">
                          Expiry
                        </Badge>
                      )}
                      {dt.hasMetadata && (
                        <Badge variant="outline" className="text-xs">
                          {dt.fieldCount} field{dt.fieldCount !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link
              href={`/${workspaceId}/settings/document-types`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Manage →
            </Link>
          </CardFooter>
        </Card>

        {/* Work Item Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Work Item Types</CardTitle>
          </CardHeader>
          <CardContent>
            {overview.workItemTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No work item types configured.</p>
            ) : (
              <div className="space-y-2">
                {overview.workItemTypes.map((wt) => (
                  <div key={wt.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{wt.name}</span>
                    {wt.entityType && (
                      <Badge variant="outline" className="text-xs">
                        {wt.entityType}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link
              href={`/${workspaceId}/settings/work-item-types`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Manage →
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
