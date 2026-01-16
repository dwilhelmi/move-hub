"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoveDetails } from "@/app/lib/types"
import { MapPin, Calendar, Edit } from "lucide-react"

interface MoveDetailsCardProps {
  moveDetails: MoveDetails | null
  isLoading?: boolean
  onEdit: () => void
}

export function MoveDetailsCard({ moveDetails, isLoading = false, onEdit }: MoveDetailsCardProps) {
  // Show loading skeleton while loading
  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Move Details
          </CardTitle>
          <CardDescription>
            Loading move details...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Moving From</p>
              <div className="h-7 bg-muted animate-pulse rounded w-3/4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Moving To</p>
              <div className="h-7 bg-muted animate-pulse rounded w-3/4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Move Date
              </p>
              <div className="h-7 bg-muted animate-pulse rounded w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show empty state only after loading is complete
  if (!moveDetails) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Move Details
          </CardTitle>
          <CardDescription>
            Set up your move information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No move details configured yet. Set up your move to start tracking your progress.
            </p>
            <Button onClick={onEdit}>
              Set Up Move Details
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const moveDate = moveDetails.moveDate
    ? new Date(moveDetails.moveDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Not set"

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="bg-slate-50 p-6 border-b-2 border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Move Details</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onEdit} className="p-2 hover:bg-white rounded-lg">
            <Edit className="w-5 h-5 text-foreground/70" />
          </Button>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Moving From</p>
            <p className="text-2xl font-bold">{moveDetails.fromLocation}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Moving To</p>
            <p className="text-2xl font-bold">{moveDetails.toLocation}</p>
          </div>
          <div className="col-span-1 md:col-span-2">
            <p className="text-sm font-semibold text-muted-foreground mb-1">Move Date</p>
            <p className="text-2xl font-bold">{moveDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
