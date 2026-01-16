"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MovingCountdownProps {
  targetDate: Date
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
}

// Module-level cache to store previous values across remounts
let cachedTimeRemaining: TimeRemaining | null = null
let cachedTargetDate: number | null = null

function calculateTimeRemaining(targetDate: Date): TimeRemaining {
  const now = new Date().getTime()
  const target = targetDate.getTime()
  const difference = target - now

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((difference % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
}

function CountdownDigit({ value, label, isLoading, allZero }: { value: number; label: string; isLoading: boolean; allZero: boolean }) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    if (displayValue !== value) {
      setIsChanging(true)
      const timer = setTimeout(() => {
        setDisplayValue(value)
        setIsChanging(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [value, displayValue])

  // Only show loading placeholder if all values are zero and we're still loading
  if (isLoading && allZero && displayValue === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center">
          <span className="text-3xl sm:text-4xl font-bold text-muted-foreground">
            --
          </span>
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center">
        <span
          className={cn(
            "text-3xl sm:text-4xl font-bold text-primary transition-all duration-300",
            isChanging && "scale-110 opacity-70"
          )}
        >
          {String(displayValue).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</span>
    </div>
  )
}

export function MovingCountdown({ targetDate }: MovingCountdownProps) {
  const targetTimestamp = targetDate.getTime()
  const hasPreviousValue = cachedTimeRemaining !== null && cachedTargetDate === targetTimestamp
  
  // Initialize with cached value if available and target date matches, otherwise calculate immediately
  const initialTimeRemaining = hasPreviousValue 
    ? cachedTimeRemaining 
    : calculateTimeRemaining(targetDate)
  
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(initialTimeRemaining)
  const [isLoading, setIsLoading] = useState(!hasPreviousValue)
  const hasCalculatedRef = useRef(false)

  useEffect(() => {
    const calculateAndUpdate = () => {
      const calculated = calculateTimeRemaining(targetDate)
      setTimeRemaining(calculated)
      cachedTimeRemaining = calculated
      cachedTargetDate = targetTimestamp
      
      if (!hasCalculatedRef.current) {
        setIsLoading(false)
        hasCalculatedRef.current = true
      }
    }

    // Calculate immediately (this will update from cached value if needed)
    calculateAndUpdate()

    // Update every second
    const interval = setInterval(calculateAndUpdate, 1000)

    return () => clearInterval(interval)
  }, [targetDate, targetTimestamp])

  const allZero = timeRemaining.days === 0 && timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moving Countdown</CardTitle>
        <CardDescription>Time remaining until your move date</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          <CountdownDigit 
            value={timeRemaining.days} 
            label="Days" 
            isLoading={isLoading}
            allZero={allZero}
          />
          <span className="text-2xl sm:text-3xl font-bold text-muted-foreground mb-6">:</span>
          <CountdownDigit 
            value={timeRemaining.hours} 
            label="Hours" 
            isLoading={isLoading}
            allZero={allZero}
          />
          <span className="text-2xl sm:text-3xl font-bold text-muted-foreground mb-6">:</span>
          <CountdownDigit 
            value={timeRemaining.minutes} 
            label="Minutes" 
            isLoading={isLoading}
            allZero={allZero}
          />
          <span className="text-2xl sm:text-3xl font-bold text-muted-foreground mb-6">:</span>
          <CountdownDigit 
            value={timeRemaining.seconds} 
            label="Seconds" 
            isLoading={isLoading}
            allZero={allZero}
          />
        </div>
      </CardContent>
    </Card>
  )
}
