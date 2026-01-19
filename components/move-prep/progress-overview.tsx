import { Card, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ProgressOverviewProps {
  completedCount: number
  totalCount: number
  className?: string
}

export function ProgressOverview({ completedCount, totalCount, className }: ProgressOverviewProps) {
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <Card className={cn("p-6 transition-all", className)}>
      <div className="flex items-center justify-between mb-4">
        <CardTitle className="text-lg font-semibold">Task Progress</CardTitle>
        <span className="text-sm font-semibold text-progress-color bg-progress-color/10 px-3 py-1 rounded-full">
          {completedCount} of {totalCount} completed
        </span>
      </div>
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden mb-2">
        <div
          className="absolute inset-y-0 left-0 bg-progress-color rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {Math.round(progress)}% complete - keep going! 🎉
      </p>
    </Card>
  )
}
