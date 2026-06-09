import { OnboardingCard } from "../../components/Onboarding";

export default async function ArrivalReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OnboardingCard participantId={Number(id)} />;
}
