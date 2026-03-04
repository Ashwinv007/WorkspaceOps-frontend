import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BreakdownItem {
  label: string
  value: number
  colorClass?: string
}

interface StatCardProps {
  title: string
  total: number
  breakdown: BreakdownItem[]
}

export function StatCard({ title, total, breakdown }: StatCardProps) {
  return (
    <Card className="hover:shadow-sm transition-shadow duration-150">
      <CardHeader className="pb-2">
        <CardTitle className="section-label">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="stat-number mb-3">
          {total}
          <span className="text-xs font-normal ml-1.5 text-muted-foreground">total</span>
        </p>
        <div className="space-y-1.5">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-block h-2 w-2 rounded-full flex-shrink-0",
                    item.colorClass ?? "bg-muted-foreground/30"
                  )}
                />
                <span className="text-muted-foreground">{item.label}</span>
              </div>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
