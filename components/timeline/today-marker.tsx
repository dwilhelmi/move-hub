import { forwardRef } from "react"

interface TodayMarkerProps {
  className?: string
}

export const TodayMarker = forwardRef<HTMLDivElement, TodayMarkerProps>(
  function TodayMarker({ className = "" }, ref) {
    return (
      <div ref={ref} className={`relative flex items-center gap-6 ${className}`}>
        <div className="relative z-10 flex items-center justify-center w-16 h-8 shrink-0">
          <div className="w-4 h-4 rounded-full bg-amber-500 border-4 border-amber-200 shadow-lg" />
        </div>
        <div className="flex-1 flex items-center gap-3">
          <div className="h-0.5 flex-1 bg-gradient-to-r from-amber-500 to-transparent" />
          <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Today
          </span>
          <div className="h-0.5 flex-1 bg-gradient-to-l from-amber-500 to-transparent" />
        </div>
      </div>
    )
  }
)
