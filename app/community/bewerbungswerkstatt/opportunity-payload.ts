export function importedOpportunityPayload(
  fields: FormData,
  sourceKey: string,
  sourceCheckedAt: string,
) {
  return {
    ...Object.fromEntries(fields),
    sourceKey,
    sourceType: "import",
    sourceCheckedAt,
  };
}
