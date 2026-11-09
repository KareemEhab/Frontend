type Props = {
  originalSum: number;
  discountSum: number;
  tax: number;
  total: number;
};

export function OrderDetailsCard({ originalSum, discountSum, tax, total }: Props) {
  return (
    <div className="rounded-lg border border-solid border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <span className="font-sans text-[1rem] font-normal leading-[160%] text-[#0F172A]">Price</span>
          <span className="font-sans text-[1.125rem] font-semibold leading-[160%] text-[#0F172A]">${originalSum.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="font-sans text-[1rem] font-normal leading-[160%] text-[#0F172A]">Discount</span>
          <span className="font-sans text-[1.125rem] font-semibold leading-[160%] text-[#0F172A]">-${discountSum.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="font-sans text-[1rem] font-normal leading-[160%] text-[#0F172A]">Tax</span>
          <span className="font-sans text-[1.125rem] font-semibold leading-[160%] text-[#0F172A]">${tax.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-4 h-px w-full bg-[#E2E8F0]" role="separator" />

      <div className="mt-4 flex items-center justify-between gap-4">
        <span className="font-sans text-[1.25rem] font-semibold leading-[150%] text-[#0F172A]">Total</span>
        <span className="font-sans text-[1.25rem] font-semibold leading-[150%] text-[#0F172A]">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

