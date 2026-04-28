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

export function shortAddress(address: string, startChars = 6, endChars = 4) {
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
