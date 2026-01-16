import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package } from "lucide-react"

export default function InventoryPage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-4xl md:pt-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
          <Package className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
          Inventory
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
          Track your belongings and packing progress
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The inventory feature is currently under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will help you catalog your belongings, track packing progress,
            and ensure nothing gets left behind during your move.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
