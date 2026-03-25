import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind CSS conflict resolution.
 *
 * Combines `clsx` (conditional class joining) with `tailwind-merge`
 * (deduplication of conflicting Tailwind utility classes).
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-blue-500", "bg-red-500")
 * // → "px-4 py-2 bg-red-500"  (bg-blue-500 removed when isActive is false)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
