import { addProfileSkill, profile } from "../../../../db/opportunity-analysis";
import { profileSkillKindValues, profileSkillLevelValues } from "../../../../db/schema";
import { activeUser, denied, json, mutationAllowed, privateHeaders, text } from "../support";

export async function GET() {
  const user = await activeUser();
  return user
    ? Response.json(await profile(user.id), { headers: privateHeaders })
    : denied(401, "Authentication required");
}
export async function POST(request: Request) {
  if (!mutationAllowed(request)) return denied(403, "Invalid origin");
  const user = await activeUser();
  if (!user) return denied(401, "Authentication required");
  const body = await json(request);
  const name = text(body?.name, 120, true),
    kind = body?.kind,
    level = body?.level;
  const careerItemIds =
    Array.isArray(body?.careerItemIds) &&
    body.careerItemIds.length <= 20 &&
    body.careerItemIds.every((id) => typeof id === "string" && id.length <= 120)
      ? body.careerItemIds
      : null;
  if (
    !name ||
    !profileSkillKindValues.includes(kind as never) ||
    !profileSkillLevelValues.includes(level as never) ||
    !careerItemIds
  )
    return denied(400, "Invalid skill data");
  const skill = await addProfileSkill(user.id, {
    name,
    kind: kind as never,
    level: level as never,
    careerItemIds,
  });
  return skill
    ? Response.json({ skill }, { status: 201, headers: privateHeaders })
    : denied(422, "Experience requires owned evidence");
}
