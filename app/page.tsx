export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-24">
      <p className="text-xs uppercase tracking-widest text-zinc-500">
        Venue Admin Survey · Phase 1
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Hello — pipeline works.
      </h1>
      <p className="text-zinc-600 leading-relaxed">
        Next.js + Tailwind + shadcn/ui + Drizzle + Neon scaffold is up. The
        public survey lives at{" "}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">
          /survey
        </code>{" "}
        and the admin dashboard at{" "}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">
          /admin
        </code>{" "}
        — built in later phases.
      </p>
      <footer className="pt-12 text-sm text-zinc-500">
        Built by Sam. Questions?{" "}
        <a
          className="underline underline-offset-2"
          href="mailto:samantha.ahhee@gmail.com"
        >
          samantha.ahhee@gmail.com
        </a>
      </footer>
    </main>
  );
}
