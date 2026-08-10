export const text = (value: unknown, max: number, required = false) =>
  typeof value === "string" && (!required || value.trim()) && value.length <= max
    ? value.trim()
    : null;

export const date = (value: unknown) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : value === null || value === "" || value === undefined
      ? null
      : undefined;
