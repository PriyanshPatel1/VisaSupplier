export function parseOptionalDateTime(value: unknown, fieldName = "date") {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return date;
}

export function toIsoOrNull(value: Date | string | null | undefined) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
