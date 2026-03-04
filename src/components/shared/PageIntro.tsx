import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface PageIntroProps {
  title: string
  description?: string
  meta?: string
  actions?: ReactNode
  className?: string
}

export function PageIntro({ title, description, meta, actions, className }: PageIntroProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5",
        className
      )}
    >
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-subtitle">{description}</p>}
        {meta && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs font-medium">{meta}</Badge>
          </div>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
