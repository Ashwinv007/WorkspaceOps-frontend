import Link from "next/link"
import { CheckCircle2, Circle, ArrowRight } from "lucide-react"
import { WorkspaceOverview } from "@/lib/types/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface OnboardingChecklistProps {
  overview: WorkspaceOverview
  workspaceId: string
  isAdmin: boolean
}

interface ChecklistItem {
  id: string
  label: string
  description: string
  done: boolean
  href: string
  adminOnly?: boolean
}

export function OnboardingChecklist({ overview, workspaceId, isAdmin }: OnboardingChecklistProps) {
  const items: ChecklistItem[] = [
    {
      id: "entity",
      label: "Add your first entity",
      description: "Create a customer, employee, vendor, or self record.",
      done: overview.entities.total > 0,
      href: `/${workspaceId}/entities`,
    },
    {
      id: "documentType",
      label: "Set up document types",
      description: "Define templates and metadata for document uploads.",
      done: overview.documentTypes.length > 0,
      href: `/${workspaceId}/settings/document-types`,
      adminOnly: true,
    },
    {
      id: "upload",
      label: "Upload first document",
      description: "Store and track expiry status in one place.",
      done: overview.documents.total > 0,
      href: `/${workspaceId}/documents`,
    },
    {
      id: "workItem",
      label: "Create first work item",
      description: "Start assigning and tracking operational tasks.",
      done: overview.workItems.total > 0,
      href: `/${workspaceId}/work-items`,
    },
  ]

  const visibleItems = items.filter((item) => !item.adminOnly || isAdmin)
  const completedCount = visibleItems.filter((item) => item.done).length
  const progress = visibleItems.length === 0 ? 100 : Math.round((completedCount / visibleItems.length) * 100)

  if (completedCount === visibleItems.length) return null

  const doneItems = visibleItems.filter((item) => item.done)
  const pendingItems = visibleItems.filter((item) => !item.done)

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Get started</CardTitle>
          <span className="text-xs text-muted-foreground">{completedCount} / {visibleItems.length} done</span>
        </div>
        <CardDescription>
          Complete these steps to set up your workspace.
        </CardDescription>
        <div className="pt-1">
          <Progress value={progress} className="h-2.5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {doneItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-lg border border-border/60 bg-surface-1 px-3 py-2 opacity-60"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <div>
              <p className="text-sm font-medium line-through decoration-muted-foreground/50">{item.label}</p>
            </div>
          </div>
        ))}
        {pendingItems.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-surface-1 px-3 py-2.5"
          >
            <div className="flex min-w-0 items-start gap-2">
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                {idx === 0 && (
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                    Next up
                  </p>
                )}
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs shrink-0">
              <Link href={item.href}>
                Go
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
