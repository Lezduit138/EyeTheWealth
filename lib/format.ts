// Indian Rupee (INR) currency and number formatting utilities
// Adheres to standard Indian numbering system: Crores, Lakhs, Thousands

export interface FormatInrOptions {
  compact?: boolean;
  showSymbol?: boolean;
}

export function formatInr(
  amount: number | null | undefined,
  options: FormatInrOptions = {}
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return options.showSymbol === false ? "0" : "₹0";
  }

  const { compact = false, showSymbol = true } = options;
  const symbol = showSymbol ? "₹" : "";
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  if (compact) {
    if (abs >= 10_000_000) {
      const cr = abs / 10_000_000;
      const formatted = cr >= 100 ? cr.toFixed(1) : cr.toFixed(2);
      return `${isNegative ? "-" : ""}${symbol}${formatted.replace(/\.?0+$/, "")} Cr`;
    }
    if (abs >= 100_000) {
      const lakh = abs / 100_000;
      const formatted = lakh >= 100 ? lakh.toFixed(1) : lakh.toFixed(2);
      return `${isNegative ? "-" : ""}${symbol}${formatted.replace(/\.?0+$/, "")} Lakh`;
    }
    if (abs >= 1_000) {
      const k = abs / 1_000;
      return `${isNegative ? "-" : ""}${symbol}${k.toFixed(1).replace(/\.?0+$/, "")}k`;
    }
  }

  const inrFormatted = abs.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

  return `${isNegative ? "-" : ""}${symbol}${inrFormatted}`;
}
