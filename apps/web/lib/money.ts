export function formatMoney(minor: number | null, currency = "USD") {
  if (minor == null) return "Rate on request";
  const cents = minor % 100 !== 0;
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(minor / 100);
}

export function formatRateRange(min: number | null, max: number | null | undefined, currency = "USD") {
  if (min == null && max == null) return "Rate on request";
  if (max != null && min != null && max !== min) return `${formatMoney(min, currency)}–${formatMoney(max, currency)}`;
  return formatMoney(min ?? max ?? null, currency);
}

export function formatTutorFee(
  rateType: string | null | undefined,
  min: number | null,
  max: number | null | undefined,
  currency = "USD",
) {
  if (rateType === "FREE") return "Free";
  const range = formatRateRange(min, max, currency);
  if (rateType === "MONTHLY") return `${range} / month`;
  if (rateType === "COURSE") return `${range} complete course`;
  return `${range} / hour`;
}

export function feeSuffix(rateType: string | null | undefined) {
  if (rateType === "FREE") return "";
  if (rateType === "MONTHLY") return "/mo";
  if (rateType === "COURSE") return " course";
  return "/hr";
}

