export const scoreScale = "0-100";

export const scoreGuidance = [
  "0-39: wesentliche Muss-Anforderungen nicht belegt.",
  "40-69: teilweise passend; offene Lücken oder Risiken klar benennen.",
  "70-100: Muss-Anforderungen weitgehend durch konkrete Evidenz belegt.",
] as const;

export type EvidenceClaim = { text: string; evidenceItemIds: string[] };

export function positiveClaimHasEvidence(
  assessment: "met" | "partial" | "not_met" | "unknown",
  evidenceItemIds: string[],
) {
  return !["met", "partial"].includes(assessment) || evidenceItemIds.length > 0;
}
