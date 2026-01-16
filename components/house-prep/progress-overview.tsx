import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProgressOverviewProps {
  completedCount: number
  totalCount: number
  className?: string
}

export function ProgressOverview({ completedCount, totalCount, className }: ProgressOverviewProps) {
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <Card className={className}>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">Task Progress</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {completedCount} of {totalCount} tasks completed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-secondary rounded-full h-3 sm:h-4 mb-3 sm:mb-4">
          <div
            className="bg-primary h-3 sm:h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {Math.round(progress)}% complete
        </p>
      </CardContent>
    </Card>
  )
}
