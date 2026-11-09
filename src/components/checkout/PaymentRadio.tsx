export function PaymentRadio({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-solid border-[#94A3B8] p-1">
        <span className="block h-3 w-3 rounded-full bg-[#2563EB]" />
      </span>
      <span className="font-sans text-[1.125rem] font-semibold leading-[160%] text-[#0F172A]">{label}</span>
    </div>
  );
}

