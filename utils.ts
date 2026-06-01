export function parseEther(amount: bigint): number {
    return Number(amount) / 1e18;
}

export function formatDate(dateString?: string) {
  if (!dateString) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function addDateDuration(startDate: string, durationMonths: bigint): string {
  const start = new Date(startDate);
  const end = new Date(start.getTime());
  end.setMonth(end.getMonth() + Number(durationMonths));
  return end.toISOString();
}

export function subtractDate(startDate: string, endDate: string): { months: number; days: number } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  let days = end.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += previousMonth.getDate();
  }
  return { months, days };
}

export function shortAddress(address?: string , startChars = 6, endChars = 4) {
  if (!address) return "-";
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function calEndDate(startDate: string, durationMonths: bigint): string {
  const start = new Date(startDate);
  const end = new Date(start.getTime());
  end.setMonth(end.getMonth() + Number(durationMonths));
    return end.toISOString();
}

export function formatUsdc(value: bigint) {
    const numericValue = Number(value) / 1e6;
  
    return new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 6,
    }).format(numericValue);
  }

  import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export function isNotProcessing(status: string) {
  if (!status) return false;
  return status.includes("PENDING") == false;
}