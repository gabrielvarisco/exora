export function toBaseUnits(value: string, decimals: number): bigint {
  const normalized = value.trim().replace(",", ".");

  if (!normalized || Number.isNaN(Number(normalized))) {
    throw new Error("Invalid amount");
  }

  const [wholePart, fractionalPart = ""] = normalized.split(".");
  const safeWhole = wholePart === "" ? "0" : wholePart;
  const safeFractional = fractionalPart.slice(0, decimals).padEnd(decimals, "0");

  return BigInt(`${safeWhole}${safeFractional}`);
}
