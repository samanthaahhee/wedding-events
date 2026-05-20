"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Check,
  Clock,
  Heart,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  HOLD_POLICY,
  INFO_LOCATION,
  SOFTWARE_CATEGORIES,
  TOOLS_CALENDAR,
  TOOLS_COMMUNICATION,
  TOOLS_DOCUMENTS,
  TOOLS_INVOICING,
  VENUE_INFO_WILLINGNESS,
  whatsappRegex,
} from "@/lib/validation";

// ============================================================
// Types
// ============================================================

type PeakBucket = "" | "0-1" | "2-3" | "4-6" | "7-10" | "10+" | "none";

type FormState = {
  peakWeddingsPerMonth: PeakBucket;
  eventMix: string;
  dayToDayOwner: string;
  dayToDayOwnerOther: string;
  bookingSource: string;
  bookingSourceOther: string;

  toolsCommunication: string[];
  toolsCalendar: string[];
  toolsDocuments: string[];
  toolsBookingSoftwareName: string;
  toolsInvoicing: string[];
  toolsOther: string;

  infoLocation: string[];
  infoLocationOther: string;

  updatePropagation: string;
  updatePropagationOnePlaceWhere: string;

  adminHoursPerWedding: string;
  pctRepetitive: string;
  holdPolicy: string[];
  holdPolicyOther: string;
  conversionRate: string;
  doubleBooking: string;
  mostFrustrating: string;

  visionSkipped: boolean;
  realtimeAvailability: string;
  coupleDirectBooking: string;
  holdReleaseWaitlist: string;
  venueInfoWillingness: string[];
  visionKillerFeature: string;

  softwareCategories: string[];
  softwareOther: string;
  eventsSoftwareReview: string;
  willingnessToPay: string;

  callInterest: string;
  venueName: string;
  contactName: string;
  contactRole: string;
  whatsapp: string;
  email: string;

  website: string; // honeypot
};

const initialState: FormState = {
  peakWeddingsPerMonth: "",
  eventMix: "",
  dayToDayOwner: "",
  dayToDayOwnerOther: "",
  bookingSource: "",
  bookingSourceOther: "",
  toolsCommunication: [],
  toolsCalendar: [],
  toolsDocuments: [],
  toolsBookingSoftwareName: "",
  toolsInvoicing: [],
  toolsOther: "",
  infoLocation: [],
  infoLocationOther: "",
  updatePropagation: "",
  updatePropagationOnePlaceWhere: "",
  adminHoursPerWedding: "",
  pctRepetitive: "",
  holdPolicy: [],
  holdPolicyOther: "",
  conversionRate: "",
  doubleBooking: "",
  mostFrustrating: "",
  visionSkipped: false,
  realtimeAvailability: "",
  coupleDirectBooking: "",
  holdReleaseWaitlist: "",
  venueInfoWillingness: [],
  visionKillerFeature: "",
  softwareCategories: [],
  softwareOther: "",
  eventsSoftwareReview: "",
  willingnessToPay: "",
  callInterest: "",
  venueName: "",
  contactName: "",
  contactRole: "",
  whatsapp: "",
  email: "",
  website: "",
};

type FormCtx = {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  toggleArr: (k: ArrKey, v: string) => void;
  errors: Record<string, string>;
};

type ArrKey =
  | "toolsCommunication"
  | "toolsCalendar"
  | "toolsDocuments"
  | "toolsInvoicing"
  | "infoLocation"
  | "holdPolicy"
  | "venueInfoWillingness"
  | "softwareCategories";

const FormContext = createContext<FormCtx | null>(null);

function useForm() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useForm outside provider");
  return ctx;
}

// ============================================================
// Primitives
// ============================================================

function OptionRow({
  type,
  name,
  value,
  checked,
  onChange,
  children,
}: {
  type: "radio" | "checkbox";
  name?: string;
  value: string;
  checked: boolean;
  onChange: (value: string, checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={[
        "flex min-h-[60px] w-full cursor-pointer items-center gap-4",
        "rounded-[12px] border bg-lk-surface px-6 py-5",
        "transition-[background-color,border-color,box-shadow] duration-150 ease-out",
        checked
          ? "border-[1.5px] border-lk-accent bg-lk-accent-soft"
          : "border border-lk-line hover:border-lk-ink",
        "focus-within:[box-shadow:var(--lk-shadow-focus)]",
      ].join(" ")}
    >
      <span className="relative flex h-[22px] w-[22px] shrink-0 items-center justify-center">
        <input
          type={type}
          name={name}
          value={value}
          checked={checked}
          onChange={(e) => onChange(value, e.target.checked)}
          className="peer sr-only"
        />
        {type === "radio" ? (
          <span
            aria-hidden
            className={[
              "block h-[22px] w-[22px] rounded-full transition-colors duration-150",
              checked
                ? "border-[1.5px] border-lk-accent"
                : "border-[1.5px] border-lk-ink-subtle",
            ].join(" ")}
          >
            {checked && (
              <span className="block h-[12px] w-[12px] translate-x-[3px] translate-y-[3px] rounded-full bg-lk-accent" />
            )}
          </span>
        ) : (
          <span
            aria-hidden
            className={[
              "flex h-[22px] w-[22px] items-center justify-center rounded-[6px] transition-colors duration-150",
              checked
                ? "border-[1.5px] border-lk-accent bg-lk-accent"
                : "border-[1.5px] border-lk-ink-subtle bg-lk-surface",
            ].join(" ")}
          >
            {checked && (
              <Check size={14} strokeWidth={2.5} className="text-white" />
            )}
          </span>
        )}
      </span>
      <span className="text-option-label text-lk-ink">{children}</span>
    </label>
  );
}

function OptionStack({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 grid gap-3">{children}</div>;
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  id?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      inputMode={inputMode}
      autoComplete={autoComplete}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={[
        "min-h-[60px] w-full rounded-[12px] border border-lk-line bg-lk-surface px-6 py-5",
        "text-body text-lk-ink placeholder:italic placeholder:text-lk-ink-subtle",
        "outline-none transition-[border-color,box-shadow] duration-150",
        "hover:border-lk-ink focus:border-lk-accent",
        "focus:[box-shadow:var(--lk-shadow-focus)]",
      ].join(" ")}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 5,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
}) {
  return (
    <textarea
      id={id}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={[
        "min-h-[140px] max-h-[240px] w-full rounded-[12px] border border-lk-line bg-lk-surface px-6 py-5",
        "text-body text-lk-ink placeholder:italic placeholder:text-lk-ink-subtle resize-y",
        "outline-none transition-[border-color,box-shadow] duration-150",
        "hover:border-lk-ink focus:border-lk-accent",
        "focus:[box-shadow:var(--lk-shadow-focus)]",
      ].join(" ")}
    />
  );
}

function QuestionBlock({
  number,
  title,
  helper,
  fieldKey,
  children,
}: {
  number: number;
  title: React.ReactNode;
  helper?: React.ReactNode;
  fieldKey: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8" data-field={fieldKey}>
      <div className="flex items-baseline gap-4">
        <span className="text-question-title text-lk-accent">
          {number}.
        </span>
        <h3 className="text-question-title text-lk-ink">{title}</h3>
      </div>
      {helper && (
        <p className="text-helper-text text-lk-ink-muted italic mt-1">
          {helper}
        </p>
      )}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-helper-text text-lk-accent mt-2">↳ {children}</p>
  );
}

function ToolSubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-caption text-lk-ink-muted mt-6 mb-3"
      style={{
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        fontWeight: 600,
      }}
    >
      {children}
    </p>
  );
}

// ============================================================
// Buttons / Nav
// ============================================================

function PrimaryButton({
  children,
  onClick,
  type = "button",
  size = "md",
  disabled = false,
  full = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  size?: "md" | "lg";
  disabled?: boolean;
  full?: boolean;
}) {
  const sizing =
    size === "lg" ? "px-9 py-[18px]" : "px-7 py-4";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        full ? "w-full" : "",
        sizing,
        "inline-flex items-center justify-center gap-3 rounded-[12px]",
        "text-button-label text-white",
        "transition-[background-color,transform] duration-150",
        "bg-lk-accent hover:bg-lk-accent-pressed hover:-translate-y-px",
        "active:translate-y-0 active:bg-lk-accent-pressed",
        "disabled:bg-lk-ink-subtle disabled:cursor-not-allowed disabled:hover:translate-y-0",
        "focus:outline-none focus-visible:[box-shadow:var(--lk-shadow-focus)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  full = false,
  variant = "ink",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  full?: boolean;
  variant?: "ink" | "accent";
}) {
  const palette =
    variant === "accent"
      ? "border-lk-accent text-lk-accent hover:bg-lk-accent hover:text-white"
      : "border-lk-ink text-lk-ink hover:bg-lk-surface";
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        full ? "w-full" : "",
        "inline-flex items-center justify-center gap-3 rounded-[12px]",
        "border bg-transparent px-6 py-[14px]",
        "text-button-label",
        palette,
        "transition-[background-color,color] duration-150",
        "focus:outline-none focus-visible:[box-shadow:var(--lk-shadow-focus)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StepNav({
  onBack,
  onContinue,
  continueLabel = "Continue",
  continueIcon = true,
  submitting = false,
}: {
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueIcon?: boolean;
  submitting?: boolean;
}) {
  return (
    <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Mobile order: Continue on top, Back below. Desktop: Back left, Continue right. */}
      <div className="order-2 sm:order-1">
        <SecondaryButton onClick={onBack} full>
          <ArrowLeft size={16} strokeWidth={2} />
          Back
        </SecondaryButton>
      </div>
      <div className="order-1 sm:order-2">
        <PrimaryButton
          type={continueLabel === "Submit" ? "submit" : "button"}
          onClick={onContinue}
          disabled={submitting}
          full
        >
          {submitting ? "Submitting…" : continueLabel}
          {continueIcon && !submitting && (
            <ArrowRight size={16} strokeWidth={2} />
          )}
        </PrimaryButton>
      </div>
    </div>
  );
}

function ProgressBar({
  step,
  label,
}: {
  step: number;
  label: string;
}) {
  const pct = Math.round((step / 6) * 100);
  return (
    <div
      className="sticky top-0 z-40"
      style={{ backgroundColor: "var(--lk-bg)" }}
    >
      <div className="mx-auto w-full max-w-[680px] px-6 pt-8 pb-3 sm:px-12">
        <div className="flex items-baseline justify-between">
          <p className="text-progress-label text-lk-ink-muted">{label}</p>
          <p className="text-progress-label text-lk-ink-muted">
            {step} <span className="text-lk-ink-subtle">/</span> 6
          </p>
        </div>
        <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-lk-line">
          <div
            aria-hidden
            className="lk-progress-fill h-full bg-lk-accent"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="pt-8 pb-12">
      <h1 className="text-section-title text-lk-ink">{title}</h1>
      <p className="text-section-subtitle text-lk-ink-muted mt-2">
        {subtitle}
      </p>
    </header>
  );
}

// ============================================================
// Step 0 — Welcome
// ============================================================

function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center text-center pt-12 pb-20 sm:pt-20">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-lk-accent-soft">
        <Heart size={40} strokeWidth={2} className="text-lk-accent" />
      </div>
      <h1 className="text-welcome-headline text-lk-ink mt-16">
        Wedding Venue
        <br />
        Operations Survey
      </h1>
      <p className="text-intro text-lk-ink-muted mt-8 max-w-[480px]">
        Hi there 👋 I&apos;m researching how wedding venues currently manage
        inquiries, bookings, communication, logistics, and coordination.
      </p>

      <div className="mt-8 w-full max-w-[480px] rounded-[16px] border border-lk-line bg-lk-surface-muted p-6 sm:p-8 text-left">
        <p className="text-body text-lk-ink">
          <span className="font-semibold">This is not a sales pitch</span> —
          I&apos;m trying to understand:
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {[
            "Where the biggest headaches are",
            "How venues currently work",
            "What tools / workflows frustrate",
            "Whether a tool could help",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-[10px] block h-[6px] w-[6px] shrink-0 rounded-full bg-lk-accent"
              />
              <span className="text-body text-lk-ink">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex items-center gap-2">
        <Clock size={16} className="text-lk-ink-muted" />
        <span className="text-caption text-lk-ink-muted">
          Takes around 4–5 minutes
        </span>
      </div>

      <div className="mt-6">
        <PrimaryButton onClick={onStart} size="lg">
          Start Survey
          <ArrowRight size={18} strokeWidth={2} />
        </PrimaryButton>
      </div>

      <p className="text-helper-text text-lk-ink-muted italic mt-12 max-w-[400px]">
        Your feedback genuinely helps shape whether this idea is worth
        building. Thank you 💛
      </p>
    </div>
  );
}

// ============================================================
// Step 1 — Your venue (Q1–Q4)
// ============================================================

function Step1() {
  const { form, set, errors } = useForm();
  return (
    <>
      <SectionHeader
        title="Your venue"
        subtitle="A bit about your venue and how you operate."
      />

      <QuestionBlock
        number={1}
        title="In your busiest month of the year, roughly how many weddings does your venue host?"
        fieldKey="peakWeddingsPerMonth"
      >
        <OptionStack>
          {(
            [
              ["0-1", "0–1"],
              ["2-3", "2–3"],
              ["4-6", "4–6"],
              ["7-10", "7–10"],
              ["10+", "10+"],
              ["none", "We don’t host weddings"],
            ] as const
          ).map(([val, label]) => (
            <OptionRow
              key={val}
              type="radio"
              name="peakWeddingsPerMonth"
              value={val}
              checked={form.peakWeddingsPerMonth === val}
              onChange={() => set("peakWeddingsPerMonth", val)}
            >
              {label}
            </OptionRow>
          ))}
        </OptionStack>
        {errors.peakWeddingsPerMonth && (
          <ErrorText>{errors.peakWeddingsPerMonth}</ErrorText>
        )}
      </QuestionBlock>

      <QuestionBlock
        number={2}
        title="Roughly what % of your bookings are weddings vs other events (corporate, private functions)?"
        fieldKey="eventMix"
      >
        <OptionStack>
          {(
            [
              ["mostly_weddings", "Mostly weddings (80%+)"],
              ["mainly_weddings", "Mainly weddings, some other events"],
              ["half_half", "About half and half"],
              ["mainly_other", "Mainly other events, some weddings"],
              ["almost_no_weddings", "Almost no weddings"],
            ] as const
          ).map(([val, label]) => (
            <OptionRow
              key={val}
              type="radio"
              name="eventMix"
              value={val}
              checked={form.eventMix === val}
              onChange={() => set("eventMix", val)}
            >
              {label}
            </OptionRow>
          ))}
        </OptionStack>
        {errors.eventMix && <ErrorText>{errors.eventMix}</ErrorText>}
      </QuestionBlock>

      <QuestionBlock
        number={3}
        title="For a typical wedding, who handles most of the inquiry-to-event-day coordination?"
        fieldKey="dayToDayOwner"
      >
        <OptionStack>
          {(
            [
              ["owner", "Owner / Director of the venue"],
              [
                "in_house_coordinator",
                "In-house Events / Bookings Coordinator (employed by us)",
              ],
              ["ops_manager", "In-house Operations / Venue Manager"],
              [
                "external_planner_most",
                "The couple’s external wedding planner does most of it; we handle logistics",
              ],
              [
                "split_50_50",
                "It’s split roughly 50/50 between us and the couple’s planner",
              ],
              ["just_me", "Just me, doing everything"],
              ["other", "Other"],
            ] as const
          ).map(([val, label]) => (
            <OptionRow
              key={val}
              type="radio"
              name="dayToDayOwner"
              value={val}
              checked={form.dayToDayOwner === val}
              onChange={() => set("dayToDayOwner", val)}
            >
              {label}
            </OptionRow>
          ))}
        </OptionStack>
        {form.dayToDayOwner === "other" && (
          <div className="mt-3" data-field="dayToDayOwnerOther">
            <TextInput
              value={form.dayToDayOwnerOther}
              onChange={(v) => set("dayToDayOwnerOther", v)}
              placeholder="Who handles it?"
            />
            {errors.dayToDayOwnerOther && (
              <ErrorText>{errors.dayToDayOwnerOther}</ErrorText>
            )}
          </div>
        )}
        {errors.dayToDayOwner && <ErrorText>{errors.dayToDayOwner}</ErrorText>}
      </QuestionBlock>

      <QuestionBlock
        number={4}
        title="Who typically inquires and books with you?"
        fieldKey="bookingSource"
      >
        <OptionStack>
          {(
            [
              [
                "couples_direct",
                "Couples directly (they find us and reach out themselves)",
              ],
              [
                "mostly_couples",
                "Mostly couples direct, occasionally a wedding planner",
              ],
              ["half_half", "About half couples, half wedding planners"],
              [
                "mostly_planners",
                "Mostly wedding planners on behalf of couples",
              ],
              [
                "almost_planners",
                "Almost always through a wedding planner or coordinator",
              ],
              [
                "marketplaces",
                "Mostly through wedding venue marketplaces or aggregators",
              ],
              ["other", "Other"],
            ] as const
          ).map(([val, label]) => (
            <OptionRow
              key={val}
              type="radio"
              name="bookingSource"
              value={val}
              checked={form.bookingSource === val}
              onChange={() => set("bookingSource", val)}
            >
              {label}
            </OptionRow>
          ))}
        </OptionStack>
        {form.bookingSource === "other" && (
          <div className="mt-3" data-field="bookingSourceOther">
            <TextInput
              value={form.bookingSourceOther}
              onChange={(v) => set("bookingSourceOther", v)}
              placeholder="How do they come to you?"
            />
            {errors.bookingSourceOther && (
              <ErrorText>{errors.bookingSourceOther}</ErrorText>
            )}
          </div>
        )}
        {errors.bookingSource && <ErrorText>{errors.bookingSource}</ErrorText>}
      </QuestionBlock>
    </>
  );
}

// ============================================================
// Step 2 — How you work (Q5–Q7)
// ============================================================

function Step2() {
  const { form, set, toggleArr, errors } = useForm();
  return (
    <>
      <SectionHeader
        title="How you work"
        subtitle="The tools and habits that run your bookings today."
      />

      <QuestionBlock
        number={5}
        title="For your most recent wedding, what tools did you use to manage it from inquiry to event day?"
        helper="Tick all that apply across each group below."
        fieldKey="toolsCommunication"
      >
        <ToolSubLabel>Communication</ToolSubLabel>
        <div className="grid gap-3">
          {TOOLS_COMMUNICATION.map((opt) => (
            <OptionRow
              key={opt.value}
              type="checkbox"
              value={opt.value}
              checked={form.toolsCommunication.includes(opt.value)}
              onChange={() => toggleArr("toolsCommunication", opt.value)}
            >
              {opt.label}
            </OptionRow>
          ))}
        </div>

        <ToolSubLabel>Calendars / scheduling</ToolSubLabel>
        <div className="grid gap-3">
          {TOOLS_CALENDAR.map((opt) => (
            <OptionRow
              key={opt.value}
              type="checkbox"
              value={opt.value}
              checked={form.toolsCalendar.includes(opt.value)}
              onChange={() => toggleArr("toolsCalendar", opt.value)}
            >
              {opt.label}
            </OptionRow>
          ))}
        </div>

        <ToolSubLabel>Documents / info</ToolSubLabel>
        <div className="grid gap-3">
          {TOOLS_DOCUMENTS.map((opt) => (
            <OptionRow
              key={opt.value}
              type="checkbox"
              value={opt.value}
              checked={form.toolsDocuments.includes(opt.value)}
              onChange={() => toggleArr("toolsDocuments", opt.value)}
            >
              {opt.label}
            </OptionRow>
          ))}
        </div>

        <ToolSubLabel>Booking / venue software</ToolSubLabel>
        <p className="text-helper-text text-lk-ink-muted -mt-1 mb-3">
          If you use one, please name it.
        </p>
        <TextInput
          value={form.toolsBookingSoftwareName}
          onChange={(v) => set("toolsBookingSoftwareName", v)}
          placeholder="e.g. Perfect Venue, HoneyBook"
        />

        <ToolSubLabel>Invoicing / payments</ToolSubLabel>
        <div className="grid gap-3">
          {TOOLS_INVOICING.map((opt) => (
            <OptionRow
              key={opt.value}
              type="checkbox"
              value={opt.value}
              checked={form.toolsInvoicing.includes(opt.value)}
              onChange={() => toggleArr("toolsInvoicing", opt.value)}
            >
              {opt.label}
            </OptionRow>
          ))}
        </div>

        <ToolSubLabel>Other</ToolSubLabel>
        <TextInput
          value={form.toolsOther}
          onChange={(v) => set("toolsOther", v)}
          placeholder="Anything else?"
        />

        {errors.toolsCommunication && (
          <ErrorText>{errors.toolsCommunication}</ErrorText>
        )}
      </QuestionBlock>

      <QuestionBlock
        number={6}
        title="When a couple asks a question about your venue (sleeps, power, BYO, layout, packages, etc.), where do you have to look to find the answer?"
        helper="Tick all that apply."
        fieldKey="infoLocation"
      >
        <OptionStack>
          {INFO_LOCATION.map((opt) => (
            <OptionRow
              key={opt.value}
              type="checkbox"
              value={opt.value}
              checked={form.infoLocation.includes(opt.value)}
              onChange={() => toggleArr("infoLocation", opt.value)}
            >
              {opt.label}
            </OptionRow>
          ))}
        </OptionStack>
        {form.infoLocation.includes("other") && (
          <div className="mt-3" data-field="infoLocationOther">
            <TextInput
              value={form.infoLocationOther}
              onChange={(v) => set("infoLocationOther", v)}
              placeholder="Where else?"
            />
            {errors.infoLocationOther && (
              <ErrorText>{errors.infoLocationOther}</ErrorText>
            )}
          </div>
        )}
        {errors.infoLocation && <ErrorText>{errors.infoLocation}</ErrorText>}
      </QuestionBlock>

      <QuestionBlock
        number={7}
        title="When something changes at your venue (a new package, a price update, a refurbished cottage, a new policy), how do you make sure everyone has the latest info — your team, couples, vendors?"
        fieldKey="updatePropagation"
      >
        <OptionStack>
          {(
            [
              ["one_place", "We update one place and everyone sees it"],
              [
                "multiple_places",
                "We have to update multiple documents / places (and sometimes forget some)",
              ],
              [
                "verbal",
                "We mostly tell people verbally / in conversation as it comes up",
              ],
              [
                "out_of_date",
                "Honestly, things get out of date and we just correct as needed",
              ],
              ["not_sure", "Not sure / haven’t thought about it"],
            ] as const
          ).map(([val, label]) => (
            <OptionRow
              key={val}
              type="radio"
              name="updatePropagation"
              value={val}
              checked={form.updatePropagation === val}
              onChange={() => set("updatePropagation", val)}
            >
              {label}
            </OptionRow>
          ))}
        </OptionStack>
        {form.updatePropagation === "one_place" && (
          <div className="mt-3" data-field="updatePropagationOnePlaceWhere">
            <p className="text-helper-text text-lk-ink-muted mb-2">
              Which place?
            </p>
            <TextInput
              value={form.updatePropagationOnePlaceWhere}
              onChange={(v) => set("updatePropagationOnePlaceWhere", v)}
              placeholder="e.g. Notion, our website, a master Google Doc"
            />
            {errors.updatePropagationOnePlaceWhere && (
              <ErrorText>{errors.updatePropagationOnePlaceWhere}</ErrorText>
            )}
          </div>
        )}
        {errors.updatePropagation && (
          <ErrorText>{errors.updatePropagation}</ErrorText>
        )}
      </QuestionBlock>
    </>
  );
}

// ============================================================
// Step 3 — Operational pain (Q8–Q13)
// ============================================================

function Step3() {
  const { form, set, toggleArr, errors } = useForm();
  return (
    <>
      <SectionHeader
        title="Operational pain"
        subtitle="Where the friction shows up. Be honest — we want the real answer."
      />

      <QuestionBlock
        number={8}
        title="Across everyone involved on your side (you, owner, coordinator, assistants, anyone), roughly how many total hours of admin go into an average wedding from first inquiry to the day after?"
        helper="Include emails, WhatsApps, calls, contracts, invoices, scheduling, vendor coordination, the lot."
        fieldKey="adminHoursPerWedding"
      >
        <OptionStack>
          {(
            [
              ["under_5", "Under 5 hours"],
              ["5_10", "5–10 hours"],
              ["10_20", "10–20 hours"],
              ["20_40", "20–40 hours"],
              ["40_plus", "40+ hours"],
              ["no_idea", "Honestly couldn’t say"],
            ] as const
          ).map(([val, label]) => (
            <OptionRow
              key={val}
              type="radio"
              name="adminHoursPerWedding"
              value={val}
              checked={form.adminHoursPerWedding === val}
              onChange={() => set("adminHoursPerWedding", val)}
            >
              {label}
            </OptionRow>
          ))}
        </OptionStack>
        {errors.adminHoursPerWedding && (
          <ErrorText>{errors.adminHoursPerWedding}</ErrorText>
        )}
      </QuestionBlock>

      <QuestionBlock
        number={9}
        title="Of that admin time, roughly what % is stuff you’ve done a hundred times before — answering the same questions, sending the same documents, chasing the same info?"
        fieldKey="pctRepetitive"
      >
        <OptionStack>
          {(
            [
              ["under_20", "Less than 20%"],
              ["20_40", "20–40%"],
              ["40_60", "40–60%"],
              ["60_80", "60–80%"],
              ["over_80", "More than 80%"],
            ] as const
          ).map(([val, label]) => (
            <OptionRow
              key={val}
              type="radio"
              name="pctRepetitive"
              value={val}
              checked={form.pctRepetitive === val}
              onChange={() => set("pctRepetitive", val)}
            >
              {label}
            </OptionRow>
          ))}
        </OptionStack>
        {errors.pctRepetitive && <ErrorText>{errors.pctRepetitive}</ErrorText>}
      </QuestionBlock>

      <QuestionBlock
        number={10}
        title="When a couple inquires about a date, what happens next?"
        helper="Tick all that apply."
        fieldKey="holdPolicy"
      >
        <OptionStack>
          {HOLD_POLICY.map((opt) => (
            <OptionRow
              key={opt.value}
              type="checkbox"
              value={opt.value}
              checked={form.holdPolicy.includes(opt.value)}
              onChange={() => toggleArr("holdPolicy", opt.value)}
            >
              {opt.label}
            </OptionRow>
          ))}
        </OptionStack>
        {form.holdPolicy.includes("other") && (
          <div className="mt-3" data-field="holdPolicyOther">
            <TextInput
              value={form.holdPolicyOther}
              onChange={(v) => set("holdPolicyOther", v)}
              placeholder="What else happens?"
            />
            {errors.holdPolicyOther && (
              <ErrorText>{errors.holdPolicyOther}</ErrorText>
            )}
          </div>
        )}
        {errors.holdPolicy && <ErrorText>{errors.holdPolicy}</ErrorText>}
      </QuestionBlock>

      <QuestionBlock
        number={11}
        title="Out of every 10 wedding inquiries you receive, roughly how many turn into actual bookings?"
        fieldKey="conversionRate"
      >
        <OptionStack>
          {(
            [
              ["1_or_fewer", "1 or fewer"],
              ["2_3", "2–3"],
              ["4_5", "4–5"],
              ["6_7", "6–7"],
              ["8_plus", "8+"],
              ["no_idea", "Honestly no idea"],
            ] as const
          ).map(([val, label]) => (
            <OptionRow
              key={val}
              type="radio"
              name="conversionRate"
              value={val}
              checked={form.conversionRate === val}
              onChange={() => set("conversionRate", val)}
            >
              {label}
            </OptionRow>
          ))}
        </OptionStack>
        {errors.conversionRate && (
          <ErrorText>{errors.conversionRate}</ErrorText>
        )}
      </QuestionBlock>

      <QuestionBlock
        number={12}
        title="In the last 12 months, has your venue ever had a date conflict — two bookings or holds for the same date that needed resolving?"
        helper="Be honest, it happens."
        fieldKey="doubleBooking"
      >
        <OptionStack>
          {(
            [
              ["more_than_once", "Yes, more than once"],
              ["once", "Yes, once"],
              ["almost", "Almost — we caught it in time"],
              ["never", "No, never"],
              ["not_sure", "Not sure / haven’t thought about it"],
            ] as const
          ).map(([val, label]) => (
            <OptionRow
              key={val}
              type="radio"
              name="doubleBooking"
              value={val}
              checked={form.doubleBooking === val}
              onChange={() => set("doubleBooking", val)}
            >
              {label}
            </OptionRow>
          ))}
        </OptionStack>
        {errors.doubleBooking && <ErrorText>{errors.doubleBooking}</ErrorText>}
      </QuestionBlock>

      <QuestionBlock
        number={13}
        title="What’s the part of managing a wedding that drives you mad?"
        helper="Be honest — one sentence is fine."
        fieldKey="mostFrustrating"
      >
        <TextArea
          value={form.mostFrustrating}
          onChange={(v) => set("mostFrustrating", v)}
        />
        {errors.mostFrustrating && (
          <ErrorText>{errors.mostFrustrating}</ErrorText>
        )}
      </QuestionBlock>
    </>
  );
}

// ============================================================
// Step 4 — Vision check (Q14–Q18, all optional)
// ============================================================

function Step4() {
  const { form, set, toggleArr } = useForm();
  return (
    <>
      <SectionHeader
        title="Vision check"
        subtitle="A few forward-looking questions about a possible future tool."
      />

      <QuestionBlock
        number={14}
        title="If couples could see your real-time availability on a public profile — with packages, FAQs, photos — would that be:"
        fieldKey="realtimeAvailability"
      >
        <OptionStack>
          {(
            [
              [
                "very_helpful_fully_public",
                "Very helpful (fewer “is this date free?” inquiries) — and we’d want it fully public",
              ],
              [
                "helpful_gated",
                "Helpful, but we’d want couples to inquire before seeing pricing/availability",
              ],
              ["neutral", "Neutral"],
              [
                "concern",
                "A concern — we prefer couples to inquire first so we can qualify them",
              ],
              ["no", "We wouldn’t want this at all"],
            ] as const
          ).map(([val, label]) => (
            <OptionRow
              key={val}
              type="radio"
              name="realtimeAvailability"
              value={val}
              checked={form.realtimeAvailability === val}
              onChange={() => set("realtimeAvailability", val)}
            >
              {label}
            </OptionRow>
          ))}
        </OptionStack>
      </QuestionBlock>

      <QuestionBlock
        number={15}
        title="Imagine a couple could browse your venue, see availability, sign a contract, and pay a deposit — all on the platform — without you handling each step manually. How does that sit with you?"
        fieldKey="coupleDirectBooking"
      >
        <OptionStack>
          {(
            [
              [
                "full_automation",
                "I’d love that — let the platform handle it, I’ll just confirm",
              ],
              [
                "partial",
                "I’d like it for some bookings (e.g. straightforward ones) but want control over premium/complex ones",
              ],
              [
                "review_each",
                "I’d want to review every booking before it’s confirmed, even if the couple completes the steps on the platform",
              ],
              [
                "human_conversation_required",
                "I want every booking to involve a human conversation before any contract or payment",
              ],
              ["no_trust", "I don’t trust automated booking for weddings"],
            ] as const
          ).map(([val, label]) => (
            <OptionRow
              key={val}
              type="radio"
              name="coupleDirectBooking"
              value={val}
              checked={form.coupleDirectBooking === val}
              onChange={() => set("coupleDirectBooking", val)}
            >
              {label}
            </OptionRow>
          ))}
        </OptionStack>
      </QuestionBlock>

      <QuestionBlock
        number={16}
        title="When a couple holds a date but doesn’t pay the deposit, sometimes other interested couples lose out. If the platform automatically managed a waitlist — releasing the date to the next couple if the first doesn’t pay in time — would you use it?"
        fieldKey="holdReleaseWaitlist"
      >
        <OptionStack>
          {(
            [
              ["yes", "Yes — that’s exactly the kind of automation I want"],
              [
                "maybe_with_control",
                "Maybe — only if I have full control over the timing and who’s on the waitlist",
              ],
              [
                "manual_decision",
                "I’d want to be notified and decide manually each time",
              ],
              ["no", "No — this needs human judgement, not automation"],
              ["not_sure", "Not sure"],
            ] as const
          ).map(([val, label]) => (
            <OptionRow
              key={val}
              type="radio"
              name="holdReleaseWaitlist"
              value={val}
              checked={form.holdReleaseWaitlist === val}
              onChange={() => set("holdReleaseWaitlist", val)}
            >
              {label}
            </OptionRow>
          ))}
        </OptionStack>
      </QuestionBlock>

      <QuestionBlock
        number={17}
        title="How much detail about your venue would you be willing to put on a public profile so couples can answer their own questions before reaching out?"
        helper="Tick all that apply."
        fieldKey="venueInfoWillingness"
      >
        <OptionStack>
          {VENUE_INFO_WILLINGNESS.map((opt) => (
            <OptionRow
              key={opt.value}
              type="checkbox"
              value={opt.value}
              checked={form.venueInfoWillingness.includes(opt.value)}
              onChange={() => toggleArr("venueInfoWillingness", opt.value)}
            >
              {opt.label}
            </OptionRow>
          ))}
        </OptionStack>
      </QuestionBlock>

      <QuestionBlock
        number={18}
        title="Of everything we’ve described in this section, what’s the ONE thing that, if a tool did it well, would make you sign up tomorrow?"
        fieldKey="visionKillerFeature"
      >
        <TextArea
          value={form.visionKillerFeature}
          onChange={(v) => set("visionKillerFeature", v)}
        />
      </QuestionBlock>
    </>
  );
}

// ============================================================
// Step 5 — Software & money (Q19–Q20)
// ============================================================

function Step5() {
  const { form, set, errors } = useForm();

  function toggleSoftware(value: string) {
    if (value === "none") {
      const wasChecked = form.softwareCategories.includes("none");
      set("softwareCategories", wasChecked ? [] : ["none"]);
    } else {
      const cur = new Set(form.softwareCategories);
      cur.delete("none");
      if (cur.has(value)) cur.delete(value);
      else cur.add(value);
      set("softwareCategories", Array.from(cur));
    }
  }

  return (
    <>
      <SectionHeader
        title="Software & money"
        subtitle="What you currently pay for, and what you’d pay for."
      />

      <QuestionBlock
        number={19}
        title="Do you currently pay for any software that helps you run the venue?"
        helper="Tick all that apply."
        fieldKey="softwareCategories"
      >
        <OptionStack>
          {SOFTWARE_CATEGORIES.map((opt) => (
            <OptionRow
              key={opt.value}
              type="checkbox"
              value={opt.value}
              checked={form.softwareCategories.includes(opt.value)}
              onChange={() => toggleSoftware(opt.value)}
            >
              {opt.label}
            </OptionRow>
          ))}
        </OptionStack>
        {form.softwareCategories.includes("other") && (
          <div className="mt-3" data-field="softwareOther">
            <TextInput
              value={form.softwareOther}
              onChange={(v) => set("softwareOther", v)}
              placeholder="Which other software?"
            />
            {errors.softwareOther && (
              <ErrorText>{errors.softwareOther}</ErrorText>
            )}
          </div>
        )}
        {form.softwareCategories.includes("events_crm") && (
          <div
            className="mt-3 rounded-[12px] border border-lk-line bg-lk-surface-muted p-5"
            data-field="eventsSoftwareReview"
          >
            <p className="text-helper-text text-lk-ink-muted mb-2">
              Which one, and what do you like or dislike about it?
            </p>
            <TextArea
              value={form.eventsSoftwareReview}
              onChange={(v) => set("eventsSoftwareReview", v)}
              rows={3}
            />
            {errors.eventsSoftwareReview && (
              <ErrorText>{errors.eventsSoftwareReview}</ErrorText>
            )}
          </div>
        )}
        {errors.softwareCategories && (
          <ErrorText>{errors.softwareCategories}</ErrorText>
        )}
      </QuestionBlock>

      <QuestionBlock
        number={20}
        title="What single thing, if a tool did it well, would make you actually pay for it?"
        fieldKey="willingnessToPay"
      >
        <TextArea
          value={form.willingnessToPay}
          onChange={(v) => set("willingnessToPay", v)}
        />
        {errors.willingnessToPay && (
          <ErrorText>{errors.willingnessToPay}</ErrorText>
        )}
      </QuestionBlock>
    </>
  );
}

// ============================================================
// Step 6 — Last bit (Q21–Q22)
// ============================================================

function Step6() {
  const { form, set, errors } = useForm();
  return (
    <>
      <SectionHeader
        title="Last bit"
        subtitle="Quick contact details and you’re done."
      />

      <QuestionBlock
        number={21}
        title="Would you be open to a 15-minute call where I show you what I’m planning and ask for your input?"
        fieldKey="callInterest"
      >
        <OptionStack>
          {(
            [
              [
                "yes_pilot",
                "Yes — and I’d consider being one of the first pilot venues",
              ],
              [
                "yes_input",
                "Yes — happy to give input even if I don’t end up using it",
              ],
              [
                "maybe_depends_month",
                "Maybe — depends what month you’re asking",
              ],
              ["no", "No thanks"],
            ] as const
          ).map(([val, label]) => (
            <OptionRow
              key={val}
              type="radio"
              name="callInterest"
              value={val}
              checked={form.callInterest === val}
              onChange={() => set("callInterest", val)}
            >
              {label}
            </OptionRow>
          ))}
        </OptionStack>
        {errors.callInterest && <ErrorText>{errors.callInterest}</ErrorText>}
      </QuestionBlock>

      <QuestionBlock
        number={22}
        title="Want to see the results or be considered for the pilot? Leave your details."
        helper="All fields optional."
        fieldKey="contact"
      >
        <div className="grid gap-3">
          <TextInput
            value={form.venueName}
            onChange={(v) => set("venueName", v)}
            placeholder="Venue name"
          />
          <TextInput
            value={form.contactName}
            onChange={(v) => set("contactName", v)}
            placeholder="Your name"
          />
          <TextInput
            value={form.contactRole}
            onChange={(v) => set("contactRole", v)}
            placeholder="Your role"
          />
          <div data-field="whatsapp">
            <TextInput
              value={form.whatsapp}
              onChange={(v) => set("whatsapp", v)}
              placeholder="WhatsApp (fastest way to reach you)"
              inputMode="tel"
              autoComplete="tel"
            />
            {errors.whatsapp && <ErrorText>{errors.whatsapp}</ErrorText>}
          </div>
          <div data-field="email">
            <TextInput
              value={form.email}
              onChange={(v) => set("email", v)}
              placeholder="Email (for the results PDF)"
              type="email"
              inputMode="email"
              autoComplete="email"
            />
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </div>
        </div>
      </QuestionBlock>
    </>
  );
}

// ============================================================
// Shell — orchestrator
// ============================================================

const STEP_LABELS = [
  "Welcome",
  "Your venue",
  "How you work",
  "Operational pain",
  "Vision check",
  "Software & money",
  "Last bit",
];

function clampStep(n: number): number {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 6) return 6;
  return Math.floor(n);
}

export default function SurveyShell({
  source,
  venueSlug,
}: {
  source: string;
  venueSlug: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const step = clampStep(Number(stepParam ?? 0));

  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const mountedAt = useRef(Date.now());

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setErrors({});
    setServerError(null);
  }, [step]);

  const set = useCallback(
    <K extends keyof FormState>(k: K, v: FormState[K]) => {
      setForm((prev) => ({ ...prev, [k]: v }));
    },
    [],
  );

  const toggleArr = useCallback((k: ArrKey, v: string) => {
    setForm((prev) => {
      const cur = new Set(prev[k]);
      if (cur.has(v)) cur.delete(v);
      else cur.add(v);
      return { ...prev, [k]: Array.from(cur) };
    });
  }, []);

  const ctx = useMemo<FormCtx>(
    () => ({ form, set, toggleArr, errors }),
    [form, set, toggleArr, errors],
  );

  // ---------- Navigation ----------

  function goToStep(n: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", String(clampStep(n)));
    router.push(`/survey?${params.toString()}`);
  }

  function validateStep(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.peakWeddingsPerMonth)
        e.peakWeddingsPerMonth = "Please choose one";
      if (form.peakWeddingsPerMonth === "none") return e;
      if (!form.eventMix) e.eventMix = "Please choose one";
      if (!form.dayToDayOwner) e.dayToDayOwner = "Please choose one";
      if (form.dayToDayOwner === "other" && !form.dayToDayOwnerOther.trim())
        e.dayToDayOwnerOther = "Please tell us who";
      if (!form.bookingSource) e.bookingSource = "Please choose one";
      if (form.bookingSource === "other" && !form.bookingSourceOther.trim())
        e.bookingSourceOther = "Please tell us how";
    } else if (s === 2) {
      const anyTool =
        form.toolsCommunication.length +
          form.toolsCalendar.length +
          form.toolsDocuments.length +
          form.toolsInvoicing.length >
          0 ||
        form.toolsBookingSoftwareName.trim() !== "" ||
        form.toolsOther.trim() !== "";
      if (!anyTool)
        e.toolsCommunication =
          "Pick at least one — across any category, or fill in booking software / other";
      if (form.infoLocation.length === 0)
        e.infoLocation = "Pick at least one";
      if (form.infoLocation.includes("other") && !form.infoLocationOther.trim())
        e.infoLocationOther = "Please tell us where";
      if (!form.updatePropagation) e.updatePropagation = "Please choose one";
      if (
        form.updatePropagation === "one_place" &&
        !form.updatePropagationOnePlaceWhere.trim()
      )
        e.updatePropagationOnePlaceWhere = "Which place?";
    } else if (s === 3) {
      if (!form.adminHoursPerWedding)
        e.adminHoursPerWedding = "Please choose one";
      if (!form.pctRepetitive) e.pctRepetitive = "Please choose one";
      if (form.holdPolicy.length === 0) e.holdPolicy = "Pick at least one";
      if (form.holdPolicy.includes("other") && !form.holdPolicyOther.trim())
        e.holdPolicyOther = "Please tell us what";
      if (!form.conversionRate) e.conversionRate = "Please choose one";
      if (!form.doubleBooking) e.doubleBooking = "Please choose one";
      if (!form.mostFrustrating.trim())
        e.mostFrustrating = "One sentence is fine";
    } else if (s === 4) {
      // optional — no required fields
    } else if (s === 5) {
      if (form.softwareCategories.length === 0)
        e.softwareCategories = "Pick at least one";
      if (
        form.softwareCategories.includes("other") &&
        !form.softwareOther.trim()
      )
        e.softwareOther = "Please tell us which other software";
      if (
        form.softwareCategories.includes("events_crm") &&
        !form.eventsSoftwareReview.trim()
      )
        e.eventsSoftwareReview = "Tell us which one and what you think";
      if (!form.willingnessToPay.trim())
        e.willingnessToPay = "One sentence is fine";
    } else if (s === 6) {
      if (!form.callInterest) e.callInterest = "Please choose one";
      if (
        form.email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
      )
        e.email = "That doesn’t look like a valid email";
      if (form.whatsapp.trim() && !whatsappRegex.test(form.whatsapp.trim()))
        e.whatsapp =
          "Use a SA number like +27 82 123 4567 or 082 123 4567";
    }
    return e;
  }

  function scrollToFirstError(es: Record<string, string>) {
    const first = Object.keys(es)[0];
    if (!first) return;
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-field="${first}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function handleContinue() {
    const es = validateStep(step);
    setErrors(es);
    if (Object.keys(es).length > 0) {
      scrollToFirstError(es);
      return;
    }
    // Q1 = "none" → exit to no-events thanks
    if (step === 1 && form.peakWeddingsPerMonth === "none") {
      router.push("/survey/thanks?variant=no-events");
      return;
    }
    goToStep(step + 1);
  }

  function handleBack() {
    goToStep(step - 1);
  }

  async function handleSubmit(ev?: React.FormEvent) {
    if (ev) ev.preventDefault();
    setServerError(null);
    const es = validateStep(6);
    setErrors(es);
    if (Object.keys(es).length > 0) {
      scrollToFirstError(es);
      return;
    }

    setSubmitting(true);
    try {
      const completionTimeSeconds = Math.round(
        (Date.now() - mountedAt.current) / 1000,
      );
      const payload = {
        source,
        venueSlug,
        peakWeddingsPerMonth: form.peakWeddingsPerMonth,
        eventMix: form.eventMix,
        dayToDayOwner: form.dayToDayOwner,
        dayToDayOwnerOther:
          form.dayToDayOwner === "other"
            ? form.dayToDayOwnerOther.trim()
            : null,
        bookingSource: form.bookingSource,
        bookingSourceOther:
          form.bookingSource === "other"
            ? form.bookingSourceOther.trim()
            : null,
        toolsCommunication: form.toolsCommunication,
        toolsCalendar: form.toolsCalendar,
        toolsDocuments: form.toolsDocuments,
        toolsBookingSoftwareName:
          form.toolsBookingSoftwareName.trim() || null,
        toolsInvoicing: form.toolsInvoicing,
        toolsOther: form.toolsOther.trim() || null,
        infoLocation: form.infoLocation,
        infoLocationOther: form.infoLocation.includes("other")
          ? form.infoLocationOther.trim()
          : null,
        updatePropagation: form.updatePropagation,
        updatePropagationOnePlaceWhere:
          form.updatePropagation === "one_place"
            ? form.updatePropagationOnePlaceWhere.trim()
            : null,
        adminHoursPerWedding: form.adminHoursPerWedding,
        pctRepetitive: form.pctRepetitive,
        holdPolicy: form.holdPolicy,
        holdPolicyOther: form.holdPolicy.includes("other")
          ? form.holdPolicyOther.trim()
          : null,
        conversionRate: form.conversionRate,
        doubleBooking: form.doubleBooking,
        mostFrustrating: form.mostFrustrating.trim(),
        visionSkipped: form.visionSkipped,
        realtimeAvailability: form.visionSkipped
          ? null
          : form.realtimeAvailability || null,
        coupleDirectBooking: form.visionSkipped
          ? null
          : form.coupleDirectBooking || null,
        holdReleaseWaitlist: form.visionSkipped
          ? null
          : form.holdReleaseWaitlist || null,
        venueInfoWillingness: form.visionSkipped
          ? []
          : form.venueInfoWillingness,
        visionKillerFeature: form.visionSkipped
          ? null
          : form.visionKillerFeature.trim() || null,
        softwareCategories: form.softwareCategories,
        softwareOther: form.softwareCategories.includes("other")
          ? form.softwareOther.trim()
          : null,
        eventsSoftwareReview: form.softwareCategories.includes("events_crm")
          ? form.eventsSoftwareReview.trim()
          : null,
        willingnessToPay: form.willingnessToPay.trim(),
        callInterest: form.callInterest,
        venueName: form.venueName.trim() || null,
        contactName: form.contactName.trim() || null,
        contactRole: form.contactRole.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        email: form.email.trim() || null,
        completionTimeSeconds,
        website: form.website,
      };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(
          data?.error ||
            "Something went wrong submitting. Please try again, or email Sam directly.",
        );
        setSubmitting(false);
        return;
      }

      router.push("/survey/thanks");
    } catch {
      setServerError(
        "Couldn’t reach the server. Please check your connection and try again.",
      );
      setSubmitting(false);
    }
  }

  // ---------- Render ----------

  if (step === 0) {
    return (
      <main className="mx-auto w-full max-w-[680px] px-6 sm:px-12">
        {/* Honeypot */}
        <Honeypot value={form.website} onChange={(v) => set("website", v)} />
        <WelcomeStep onStart={() => goToStep(1)} />
      </main>
    );
  }

  const label = STEP_LABELS[step];

  return (
    <>
      <ProgressBar step={step} label={label} />
      <main className="mx-auto w-full max-w-[680px] px-6 pt-8 pb-12 sm:px-12 sm:pb-24">
        <Honeypot value={form.website} onChange={(v) => set("website", v)} />
        <FormContext.Provider value={ctx}>
          <form
            onSubmit={step === 6 ? handleSubmit : (e) => e.preventDefault()}
            noValidate
          >
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
            {step === 4 && <Step4 />}
            {step === 5 && <Step5 />}
            {step === 6 && <Step6 />}

            {serverError && (
              <div className="mb-6 rounded-[12px] border border-lk-line bg-lk-surface p-5">
                <p className="text-helper-text text-lk-accent">
                  ↳ {serverError}
                </p>
              </div>
            )}

            {step === 6 ? (
              <StepNav
                onBack={handleBack}
                onContinue={() => handleSubmit()}
                continueLabel="Submit"
                continueIcon={false}
                submitting={submitting}
              />
            ) : (
              <StepNav onBack={handleBack} onContinue={handleContinue} />
            )}
          </form>
        </FormContext.Provider>
      </main>
    </>
  );
}

function Honeypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden"
    >
      <label>
        Website
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}
