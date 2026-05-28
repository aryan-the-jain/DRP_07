type FacilitatorMessageModalProps = {
  facilitatorName: string;
};

export function FacilitatorMessageModal({
  facilitatorName,
}: FacilitatorMessageModalProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-[#faf7f1] p-4 text-sm leading-6 text-stone-600 shadow-sm">
      <p className="mb-1 font-semibold text-stone-900">
        Private conversation with {facilitatorName}
      </p>
      This is a private space to message the facilitator directly. What you share
      here is only visible to you and {facilitatorName}.
    </div>
  );
}
