import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BreakdownItem {
  label: string
  value: number
  color?: string
}

interface StatCardProps {
  title: string
  total: number
  breakdown: BreakdownItem[]
}

export function StatCard({ title, total, breakdown }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold mb-3">{total}</p>
        <div className="space-y-1.5">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {item.color && (
                  <span
                    className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                )}
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
