import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

export const INTERESTS = [
  "Culture & heritage",
  "Food & markets",
  "Nature & outdoors",
  "Spirituality",
  "Shopping",
  "Nightlife",
  "Adventure",
  "Photography",
] as const;

export const STYLES = ["relaxed", "balanced", "packed"] as const;
export const DIETS = [
  "none",
  "vegetarian",
  "vegan",
  "jain",
  "halal",
  "gluten-free",
] as const;

const Input = z.object({
  city: z.string().min(1),
  days: z.number().int().min(1).max(14),
  budget: z.number().min(0),
  style: z.enum(STYLES),
  interests: z.array(z.enum(INTERESTS)).max(8),
  diet: z.enum(DIETS),
  notes: z.string().max(200).optional(),
});

export type DayPlan = {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  food: string;
  estimatedCost: string;
};

export type Itinerary = {
  city: string;
  days: number;
  budgetPerDay: number;
  plan: DayPlan[];
};

export const planTrip = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => Input.parse(v))
  .handler(async ({ data }): Promise<Itinerary> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const paceGuide: Record<(typeof STYLES)[number], string> = {
      relaxed: "Relaxed pace: 1-2 main activities per day, plenty of downtime and slow meals.",
      balanced: "Balanced pace: 2-3 activities per day with reasonable travel between them.",
      packed: "Packed pace: 3-4 activities per day, maximize sights while staying realistic.",
    };

    const dietGuide: Record<(typeof DIETS)[number], string> = {
      none: "No dietary restrictions.",
      vegetarian: "Strictly vegetarian food only (no meat, fish, or eggs in dishes).",
      vegan: "Strictly vegan food only (no meat, fish, eggs, dairy, ghee, paneer, or honey).",
      jain: "Strict Jain food only (no meat, eggs, onion, garlic, or root vegetables like potato/carrot).",
      halal: "Halal food only; recommend halal-certified or Muslim-owned restaurants where possible.",
      "gluten-free": "Gluten-free options only (avoid wheat rotis, naan, samosas; suggest rice/millet-based dishes).",
    };

    const interestsLine =
      data.interests.length > 0
        ? `Traveler's interests (prioritize these): ${data.interests.join(", ")}.`
        : "No specific interests — offer a well-rounded mix.";

    const notesLine = data.notes?.trim()
      ? `Additional traveler notes to honor: "${data.notes.trim()}".`
      : "";

    const prompt = `You are an expert India travel planner. Create a ${data.days}-day itinerary for ${data.city}, India with a budget of ₹${data.budget} per day per person.

${paceGuide[data.style]}
${interestsLine}
Dietary requirement: ${dietGuide[data.diet]}
${notesLine}

Return ONLY valid JSON matching this exact shape (no markdown, no code fences):
{
  "plan": [
    {
      "day": 1,
      "title": "short theme for the day",
      "morning": "morning activity with brief detail",
      "afternoon": "afternoon activity with brief detail",
      "evening": "evening activity with brief detail",
      "food": "specific food/restaurant recommendations matching the dietary requirement",
      "estimatedCost": "₹ amount with brief breakdown"
    }
  ]
}

Include ${data.days} day objects. Keep each field concise (1-2 sentences). Every activity should reflect the traveler's interests and pace. Every food suggestion MUST strictly satisfy the dietary requirement. Keep costs within budget.`;

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      prompt,
    });

    const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1)) as {
      plan: DayPlan[];
    };

    return {
      city: data.city,
      days: data.days,
      budgetPerDay: data.budget,
      plan: parsed.plan,
    };
  });
