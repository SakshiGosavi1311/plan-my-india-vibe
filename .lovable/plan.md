# Personalize the itinerary with preferences

Extend the trip planner form and AI prompt so itineraries reflect the traveler's style, interests, and dietary needs.

## New inputs on the home form

Added below the existing City / Days / Budget fields:

1. **Travel style** (single select chips) — one of:
   - Relaxed, Balanced, Packed
2. **Interests** (multi-select chips, pick any) — from:
   - Culture & heritage, Food & markets, Nature & outdoors, Spirituality, Shopping, Nightlife, Adventure, Photography
3. **Dietary preference** (single select) — one of:
   - No preference, Vegetarian, Vegan, Jain, Halal, Gluten-free
4. **Notes** (optional short textarea, max 200 chars) — free-form ("traveling with kids", "avoid spicy", etc.)

Chips are simple styled buttons (no new dependencies), keyboard-accessible, matching the existing orange/white theme. Mobile: chips wrap; layout stays single-column.

## Data flow

- `src/lib/trip-planner.functions.ts`
  - Extend the Zod `Input` schema with:
    - `style: z.enum(["relaxed","balanced","packed"])`
    - `interests: z.array(z.enum([...])).max(8)`
    - `diet: z.enum(["none","vegetarian","vegan","jain","halal","gluten-free"])`
    - `notes: z.string().max(200).optional()`
  - Update the AI prompt to inject these preferences so:
    - Pacing (activities per day) reflects `style`.
    - `morning` / `afternoon` / `evening` skew toward selected `interests`.
    - `food` recommendations respect `diet` strictly, and honor `notes`.
  - Keep the same JSON output shape — no changes to `DayPlan` / `Itinerary` types, so `ItineraryView` is untouched.

- `src/routes/index.tsx`
  - Add controlled state for the four new fields (sensible defaults: Balanced, [Culture & heritage, Food & markets], No preference, empty notes).
  - Pass them through in the `plan({ data: ... })` call.
  - Small, reusable `ChipGroup` component local to the file for single- and multi-select behavior.

## Out of scope

- No schema/db changes, no new routes, no saved profiles.
- Itinerary rendering unchanged.
- No new packages.
