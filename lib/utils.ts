import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a datetime-local input value (YYYY-MM-DDTHH:mm) to an ISO string.
 * The input is in local time, so we construct a Date object treating it as local time.
 */
export function datetimeLocalToISO(datetimeLocal: string): string {
  if (!datetimeLocal) return ""
  // datetime-local format: "YYYY-MM-DDTHH:mm" (in local time)
  const [datePart, timePart] = datetimeLocal.split("T")
  const [year, month, day] = datePart.split("-").map(Number)
  const [hours, minutes] = timePart.split(":").map(Number)
  
  // Create a Date object in local time (this constructor treats values as local)
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0)
  return date.toISOString()
}

/**
 * Converts an ISO string to a datetime-local input value (YYYY-MM-DDTHH:mm).
 * The output should be in local time for the datetime-local input.
 */
export function isoToDatetimeLocal(isoString: string): string {
  if (!isoString) return ""
  const date = new Date(isoString)
  
  // Get local time components (not UTC)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Converts a date input value (YYYY-MM-DD) to an ISO string.
 * The input represents a date in local time. We create a Date at local noon
 * to avoid timezone issues, then convert to ISO.
 */
export function dateToISO(dateString: string): string {
  if (!dateString) return ""
  // date format: "YYYY-MM-DD"
  // Parse as local date components (not UTC)
  const [year, month, day] = dateString.split("-").map(Number)
  
  // Create a Date object at local noon (to avoid DST edge cases at midnight)
  // This ensures the date portion is always correct regardless of timezone
  const date = new Date(year, month - 1, day, 12, 0, 0, 0)
  return date.toISOString()
}

/**
 * Converts an ISO string to a date input value (YYYY-MM-DD).
 * The output should be the local date, not the UTC date.
 */
export function isoToDate(isoString: string): string {
  if (!isoString) return ""
  const date = new Date(isoString)
  
  // Get local date components (not UTC)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  
  return `${year}-${month}-${day}`
}
