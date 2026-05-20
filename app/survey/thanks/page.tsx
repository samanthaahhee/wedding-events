import { Check } from "lucide-react";

type SearchParams = Promise<{ variant?: string }>;

export const metadata = { title: "Thanks for your time" };

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const isNoEvents = params.variant === "no-events";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[680px] flex-col items-center justify-center px-6 py-16 text-center sm:px-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-lk-accent-soft">
        <Check size={40} strokeWidth={2} className="text-lk-accent" />
      </div>

      <h1 className="text-thank-headline text-lk-ink mt-10">
        {isNoEvents ? "No worries." : "That’s it."}
      </h1>

      <p className="text-intro text-lk-ink-muted mt-6 max-w-[480px]">
        {isNoEvents
          ? "Thanks for letting me know. Sounds like you’re not the right fit for this one. Appreciate the click."
          : "Thanks for taking the time. I’ll be in touch with the anonymised results in a few weeks. If you ticked yes to a call, I’ll reach out within a week."}
      </p>

      <p className="text-caption text-lk-ink italic mt-10">— Sam</p>
    </main>
  );
}
