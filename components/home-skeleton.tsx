import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function HomeSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-6xl md:pt-8">
      {/* Welcome Banner Skeleton */}
      <Card className="mb-6 bg-primary text-primary-foreground border-0 rounded-2xl overflow-hidden relative">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <CardHeader className="relative p-6 sm:p-8">
          <div className="h-10 sm:h-12 md:h-14 bg-white/20 rounded-lg animate-pulse w-64 max-w-full"></div>
        </CardHeader>
      </Card>

      {/* Move Details Card Skeleton */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-muted p-6 border-b-2 border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted-foreground/20 animate-pulse"></div>
              <div className="h-8 bg-muted-foreground/20 rounded w-40 animate-pulse"></div>
            </div>
            <div className="w-10 h-10 bg-muted-foreground/20 rounded-lg animate-pulse"></div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="h-4 bg-muted animate-pulse rounded w-24 mb-2"></div>
              <div className="h-8 bg-muted animate-pulse rounded w-3/4"></div>
            </div>
            <div>
              <div className="h-4 bg-muted animate-pulse rounded w-24 mb-2"></div>
              <div className="h-8 bg-muted animate-pulse rounded w-3/4"></div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <div className="h-4 bg-muted animate-pulse rounded w-24 mb-2"></div>
              <div className="h-8 bg-muted animate-pulse rounded w-48"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Countdown Skeleton */}
        <Card className="bg-countdown-bg text-countdown-foreground border-0 rounded-2xl p-6">
          <div className="h-6 bg-white/20 rounded w-40 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 sm:h-10 bg-white/20 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-white/20 rounded w-12 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </Card>

        {/* Progress Overview Skeleton */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-muted animate-pulse rounded w-32"></div>
            <div className="h-6 bg-muted animate-pulse rounded-full w-28"></div>
          </div>
          <div className="h-3 bg-secondary rounded-full mb-2 overflow-hidden">
            <div className="h-full bg-muted animate-pulse rounded-full w-0"></div>
          </div>
          <div className="h-4 bg-muted animate-pulse rounded w-40"></div>
        </Card>
      </div>

      {/* Quick Actions Skeleton */}
      <Card className="p-6">
        <div className="h-7 bg-muted animate-pulse rounded w-32 mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 bg-muted rounded-xl border-2 border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-muted-foreground/20 animate-pulse"></div>
              <div className="h-5 bg-muted-foreground/20 animate-pulse rounded w-20"></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
