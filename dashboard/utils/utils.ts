import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function formatDecimal(value: number, decimal: number): number {
  return value * 10 ** decimal;
}

export function formatNumber(
  value: number | string,
  showSuffix: boolean = true,
  decimals: number = 2,
  minSuffix: "" | "K" | "M" | "B" | "T" = ""
): string {
  value = Number(value);
  if (value === 0) return "0";
  if (value < 0.0001) return "<0.0001";

  if (value < 1) {
    return value.toFixed(4).replace(/\.?0+$/, "");
  }

  const suffixes = ["", "K", "M", "B", "T"];
  const minIndex = suffixes.indexOf(minSuffix);

  let index = 0;
  let scaledValue = value;

  while (scaledValue >= 1000 && index < suffixes.length - 1) {
    scaledValue /= 1000;
    index++;
  }

  if (showSuffix && index >= minIndex) {
    const formatted = scaledValue
      .toFixed(decimals)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formatted}${suffixes[index]}`.trim();
  }

  // Fallback: show full number without any suffix
  const isInteger = Number.isInteger(value);
  return isInteger
    ? value.toLocaleString()
    : value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const hoursAgo = (date: string) => {
  const diffInHours = dayjs().diff(dayjs(date), 'hour');
  return diffInHours;
};

export const formatDate = (date: string, format: string = 'YYYY-MM-DD, hh:mm') => {
  return dayjs(date).format(format);
};
