"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { calculateTimeRemaining, type TimeRemaining } from "@/lib/countdown"

interface MovingCountdownProps {
  targetDate: Date
}

// Module-level cache to store previous values across remounts
let cachedTimeRemaining: TimeRemaining | null = null
let cachedTargetDate: number | null = null

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

  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-bold mb-1 text-countdown-foreground transition-all duration-300">
        {(isLoading && allZero && displayValue === 0) ? "--" : String(displayValue).padStart(2, "0")}
      </div>
      <div className="text-[10px] sm:text-xs opacity-80 text-countdown-foreground">{label}</div>
    </div>
  )
}

export function MovingCountdown({ targetDate }: MovingCountdownProps) {
  const targetTimestamp = targetDate.getTime()
  const hasPreviousValue = cachedTimeRemaining !== null && cachedTargetDate === targetTimestamp
  
  // Initialize with cached value if available and target date matches, otherwise calculate immediately
  const initialTimeRemaining = hasPreviousValue 
    ? cachedTimeRemaining! 
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
    <Card className="bg-countdown-bg text-countdown-foreground border-0 rounded-2xl p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-4 opacity-90">Moving Countdown</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <CountdownDigit 
          value={timeRemaining.days} 
          label="Days" 
          isLoading={isLoading}
          allZero={allZero}
        />
        <CountdownDigit 
          value={timeRemaining.hours} 
          label="Hours" 
          isLoading={isLoading}
          allZero={allZero}
        />
        <CountdownDigit 
          value={timeRemaining.minutes} 
          label="Minutes" 
          isLoading={isLoading}
          allZero={allZero}
        />
        <CountdownDigit 
          value={timeRemaining.seconds} 
          label="Seconds" 
          isLoading={isLoading}
          allZero={allZero}
        />
      </div>
    </Card>
  )
}
