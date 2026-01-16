import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

export default function SFGuidePage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-4xl md:pt-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
          <MapPin className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
          San Francisco Guide
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
          Resources for settling into Russian Hill, San Francisco
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The San Francisco settling-in guide is currently under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will provide helpful resources, tips, and information for
            settling into your new neighborhood in Russian Hill, San Francisco, CA.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
