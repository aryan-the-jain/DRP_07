import { OnboardingCard } from "../../components/Onboarding";

export default async function ArrivalReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  return <OnboardingCard participantId={Number(id)} from={from} />;
}
