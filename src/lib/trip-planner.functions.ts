import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const Input = z.object({
  city: z.string().min(1),
  days: z.number().int().min(1).max(14),
  budget: z.number().min(0),
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

    const prompt = `You are an expert India travel planner. Create a ${data.days}-day itinerary for ${data.city}, India with a budget of ₹${data.budget} per day per person.

Return ONLY valid JSON matching this exact shape (no markdown, no code fences):
{
  "plan": [
    {
      "day": 1,
      "title": "short theme for the day",
      "morning": "morning activity with brief detail",
      "afternoon": "afternoon activity with brief detail",
      "evening": "evening activity with brief detail",
      "food": "specific food/restaurant recommendations",
      "estimatedCost": "₹ amount with brief breakdown"
    }
  ]
}

Include ${data.days} day objects. Keep each field concise (1-2 sentences). Suggest realistic local activities, authentic Indian food, and keep costs within budget.`;

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
