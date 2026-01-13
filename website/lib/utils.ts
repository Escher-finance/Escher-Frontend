import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, showSuffix: boolean = true): string {
  if (value === 0) return "0";
  if (value < 0.0001) return "<0.0001";

  // Handle values less than 1
  if (value < 1) {
    return value.toFixed(4).replace(/\.?0+$/, ""); // Trim trailing zeros
  }

  const suffixes = ["", "K", "M", "B", "T"];
  let index = 0;

  let scaledValue = value;
  if (showSuffix) {
    while (scaledValue >= 1000 && index < suffixes.length - 1) {
      scaledValue /= 1000;
      index++;
    }
  }

  const formatted = scaledValue
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return showSuffix ? `${formatted} ${suffixes[index]}`.trim() : formatted;
}

export function formatDecimal(value: number, decimals: number): number {
  return Number(value) * 10 ** decimals;
}