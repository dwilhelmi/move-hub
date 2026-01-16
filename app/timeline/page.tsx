import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export default function TimelinePage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-4xl md:pt-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
          <Calendar className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
          Timeline
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
          Plan your moving timeline and milestones
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The timeline feature is currently under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will help you plan and track all the important dates and milestones
            for your move from Olathe, KS to San Francisco, CA.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
