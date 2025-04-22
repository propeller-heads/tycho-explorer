import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPoolId = (id: string): string => {
  if (!id) return '';
  if (id.length <= 10) return id;
  return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`;
};