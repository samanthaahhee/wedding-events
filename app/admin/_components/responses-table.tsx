"use client";

import { useState } from "react";

export type ResponseSummaryRow = {
  id: string;
  createdAt: string;
  source: string;
  venueName: string | null;
  contactName: string | null;
  dayToDayOwner: string | null;
  callInterest: string | null;
  adminHoursPerWedding: string | null;
  full: Record<string, unknown>;
};

const OWNER_LABEL: Record<string, string> = {
  owner: "Owner",
  in_house_coordinator: "Coordinator",
  ops_manager: "Ops manager",
  external_planner_most: "External planner",
  split_50_50: "Split 50/50",
  just_me: "Just me",
  other: "Other",
};

const CALL_LABEL: Record<string, string> = {
  yes_pilot: "Pilot",
  yes_input: "Input",
  maybe_depends_month: "Maybe",
  no: "No",
};

const HOURS_LABEL: Record<string, string> = {
  under_5: "<5h",
  "5_10": "5–10h",
  "10_20": "10–20h",
  "20_40": "20–40h",
  "40_plus": "40h+",
  no_idea: "—",
};

export function ResponsesTable({ rows }: { rows: ResponseSummaryRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openRow = openId ? rows.find((r) => r.id === openId) : null;

  if (rows.length === 0) {
    return (
      <p className="text-helper-text text-lk-ink-muted italic">
        No responses yet.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-[12px] border border-lk-line bg-lk-surface">
        <table className="w-full border-collapse text-helper-text">
          <thead className="border-b border-lk-line bg-lk-surface-muted text-left">
            <tr>
              <Th>Received</Th>
              <Th>Venue</Th>
              <Th>Contact</Th>
              <Th>Owner</Th>
              <Th>Hours / wedding</Th>
              <Th>Call</Th>
              <Th>Source</Th>
              <Th>&nbsp;</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-lk-line last:border-0">
                <Td>{formatDate(r.createdAt)}</Td>
                <Td>{r.venueName || "—"}</Td>
                <Td>{r.contactName || "—"}</Td>
                <Td>
                  {r.dayToDayOwner
                    ? OWNER_LABEL[r.dayToDayOwner] || r.dayToDayOwner
                    : "—"}
                </Td>
                <Td>
                  {r.adminHoursPerWedding
                    ? HOURS_LABEL[r.adminHoursPerWedding] || r.adminHoursPerWedding
                    : "—"}
                </Td>
                <Td>
                  {r.callInterest
                    ? CALL_LABEL[r.callInterest] || r.callInterest
                    : "—"}
                </Td>
                <Td>
                  <span className="text-lk-ink-muted">{r.source}</span>
                </Td>
                <Td>
                  <button
                    type="button"
                    onClick={() => setOpenId(r.id)}
                    className="text-lk-accent hover:underline"
                  >
                    View
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openRow && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-6"
          onClick={() => setOpenId(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-t-[16px] bg-lk-bg p-6 sm:rounded-[16px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="text-question-title text-lk-ink">
                Response detail
              </h3>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="text-helper-text text-lk-ink-muted hover:text-lk-ink"
              >
                Close
              </button>
            </div>
            <dl className="grid gap-3 text-helper-text">
              {Object.entries(openRow.full).map(([key, val]) => (
                <div
                  key={key}
                  className="grid grid-cols-1 gap-1 sm:grid-cols-[180px_1fr]"
                >
                  <dt className="text-lk-ink-muted">{key}</dt>
                  <dd className="text-lk-ink break-words">
                    {formatValue(val)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-medium text-lk-ink-muted">{children}</th>
  );
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top text-lk-ink">{children}</td>;
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  });
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (Array.isArray(v)) return v.length === 0 ? "—" : v.join(", ");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (v instanceof Date) return v.toISOString();
  return String(v);
}
