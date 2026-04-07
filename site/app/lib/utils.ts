import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const APP_STORE_URL = "https://apps.apple.com/us/app/neurima/id6758975201"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
