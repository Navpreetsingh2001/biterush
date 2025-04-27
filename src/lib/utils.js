
import { clsx } from "clsx" // Removed ClassValue type import
import { twMerge } from "tailwind-merge"

export function cn(...inputs) { // Removed type annotation
  return twMerge(clsx(inputs))
}
