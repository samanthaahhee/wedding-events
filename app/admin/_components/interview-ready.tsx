"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type WarmLead = {
  id: string;
  venueName: string | null;
  contactName: string | null;
  contactRole: string | null;
  email: string | null;
  whatsapp: string | null;
  callInterest: string | null;
  createdAt: string;
  followedUp: boolean;
};

const CALL_INTEREST_LABEL: Record<string, string> = {
  yes_pilot: "Pilot",
  yes_input: "Input",
  maybe_depends_month: "Maybe",
  no: "No",
};

export function InterviewReadyList({ leads }: { leads: WarmLead[] }) {
  const open = leads.filter((l) => !l.followedUp);
  const done = leads.filter((l) => l.followedUp);
  const [showDone, setShowDone] = useState(false);

  if (leads.length === 0) {
    return (
      <p className="text-helper-text text-lk-ink-muted italic">
        No warm leads yet. People who pick &ldquo;Pilot&rdquo; or
        &ldquo;Input&rdquo; on Q19 will show up here.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {open.map((l) => (
        <LeadCard key={l.id} lead={l} />
      ))}
      {done.length > 0 && (
        <div className="mt-4 border-t border-lk-line pt-4">
          <button
            type="button"
            onClick={() => setShowDone((v) => !v)}
            className="text-helper-text text-lk-ink-muted hover:text-lk-ink"
          >
            {showDone ? "Hide" : "Show"} contacted ({done.length})
          </button>
          {showDone && (
            <div className="mt-3 grid gap-3 opacity-70">
              {done.map((l) => (
                <LeadCard key={l.id} lead={l} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead }: { lead: WarmLead }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggleFollowedUp() {
    setPending(true);
    await fetch(`/api/admin/responses/${lead.id}/follow-up`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followedUp: !lead.followedUp }),
    });
    router.refresh();
    setPending(false);
  }

  const badge = lead.callInterest
    ? CALL_INTEREST_LABEL[lead.callInterest] || lead.callInterest
    : null;

  return (
    <div className="rounded-[12px] border border-lk-line bg-lk-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-question-title text-lk-ink">
            {lead.venueName || "Unnamed venue"}
          </p>
          <p className="text-helper-text text-lk-ink-muted">
            {lead.contactName || "—"}
            {lead.contactRole ? ` · ${lead.contactRole}` : ""}
          </p>
        </div>
        {badge && (
          <span className="rounded-full bg-lk-accent-soft px-2.5 py-0.5 text-helper-text text-lk-accent">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="text-helper-text text-lk-ink hover:underline"
          >
            ✉ {lead.email}
          </a>
        )}
        {lead.whatsapp && (
          <a
            href={`https://wa.me/${lead.whatsapp.replace(/[^\d+]/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="text-helper-text text-lk-ink hover:underline"
          >
            ✆ {lead.whatsapp}
          </a>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-helper-text text-lk-ink-muted">
          {new Date(lead.createdAt).toLocaleDateString("en-ZA", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
        <button
          type="button"
          onClick={toggleFollowedUp}
          disabled={pending}
          className="inline-flex items-center rounded-full border border-lk-ink bg-transparent px-3 py-1.5 text-helper-text text-lk-ink transition-colors duration-150 hover:bg-lk-ink hover:text-white disabled:opacity-50"
        >
          {pending
            ? "…"
            : lead.followedUp
              ? "Mark as not contacted"
              : "Mark as contacted"}
        </button>
      </div>
    </div>
  );
}
