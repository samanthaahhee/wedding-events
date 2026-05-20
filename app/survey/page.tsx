import { Suspense } from "react";
import SurveyShell from "./survey-shell";

type SearchParams = Promise<{
  src?: string;
  v?: string;
  step?: string;
}>;

export const metadata = {
  title: "Wedding Venue Operations Survey",
  description:
    "A short research survey on how South African wedding venues handle bookings and event admin. 4–5 minutes.",
};

export default async function SurveyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const source = params.src?.trim() || "direct";
  const venueSlug = params.v?.trim() || null;

  return (
    <Suspense fallback={null}>
      <SurveyShell source={source} venueSlug={venueSlug} />
    </Suspense>
  );
}
