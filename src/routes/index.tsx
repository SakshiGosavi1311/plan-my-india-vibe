import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { planTrip, type Itinerary } from "@/lib/trip-planner.functions";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const plan = useServerFn(planTrip);
  const [city, setCity] = useState("");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(2500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setItinerary(null);
    try {
      const res = await plan({ data: { city: city.trim(), days, budget } });
      setItinerary(res);
    } catch (err) {
      console.error(err);
      setError("We couldn't plan your trip right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setItinerary(null);
    setError(null);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-5 py-5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground font-display text-lg font-semibold">
            Y
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">Yatra</h1>
            <p className="truncate text-xs text-muted-foreground">AI trip planner for India</p>
          </div>
        </div>
      </header>

      {!itinerary ? (
        <section className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
          <div className="mb-8 text-center">
            <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
              Namaste ✦ Plan in seconds
            </span>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Your next India trip,{" "}
              <span className="text-primary">crafted by AI</span>.
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Tell us where you're going, for how long, and your daily budget. We'll do the rest.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
          >
            <div className="space-y-5">
              <Field label="City" htmlFor="city">
                <input
                  id="city"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Jaipur, Goa, Varanasi..."
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </Field>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Number of days" htmlFor="days">
                  <input
                    id="days"
                    type="number"
                    min={1}
                    max={14}
                    required
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>

                <Field label="Budget per day (₹)" htmlFor="budget">
                  <input
                    id="budget"
                    type="number"
                    min={0}
                    step={100}
                    required
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={loading || !city.trim()}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Spinner /> Planning your trip...
                  </>
                ) : (
                  <>Plan my trip →</>
                )}
              </button>

              {error && (
                <p className="text-center text-sm text-destructive">{error}</p>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Suggestions are AI-generated. Verify hours & prices before you go.
          </p>
        </section>
      ) : (
        <ItineraryView itinerary={itinerary} onReset={reset} />
      )}
    </main>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
  );
}

function ItineraryView({
  itinerary,
  onReset,
}: {
  itinerary: Itinerary;
  onReset: () => void;
}) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Your itinerary
          </p>
          <h2 className="mt-1 text-3xl font-semibold sm:text-4xl">
            {itinerary.days} days in {itinerary.city}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Budget: ₹{itinerary.budgetPerDay.toLocaleString("en-IN")} / day
          </p>
        </div>
        <button
          onClick={onReset}
          className="shrink-0 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-secondary"
        >
          ← New trip
        </button>
      </div>

      <div className="space-y-5">
        {itinerary.plan.map((d) => (
          <article
            key={d.day}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="flex items-center gap-4 border-b border-border bg-primary-soft/60 px-5 py-4 sm:px-6">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-primary-foreground">
                {d.day}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  Day {d.day}
                </p>
                <h3 className="truncate text-lg font-semibold">{d.title}</h3>
              </div>
            </div>

            <div className="divide-y divide-border">
              <Row icon="☀️" label="Morning" text={d.morning} />
              <Row icon="🌤️" label="Afternoon" text={d.afternoon} />
              <Row icon="🌙" label="Evening" text={d.evening} />
              <Row icon="🍽️" label="Food" text={d.food} />
              <Row icon="₹" label="Estimated cost" text={d.estimatedCost} emphasis />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Row({
  icon,
  label,
  text,
  emphasis = false,
}: {
  icon: string;
  label: string;
  text: string;
  emphasis?: boolean;
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 px-5 py-4 sm:px-6">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-base">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={`mt-0.5 text-sm leading-relaxed ${
            emphasis ? "font-semibold text-foreground" : "text-foreground"
          }`}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
