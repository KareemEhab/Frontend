import confirmedIcon from "../assets/confirmed.svg";

export function OrderCompletePage() {
  return (
    <section className="px-15 pt-24 pb-30.75 font-sans">
      <div className="mx-auto flex max-w-160 flex-col items-center text-center">
        <img src={confirmedIcon} alt="" className="h-16 w-16" />
        <h1 className="mt-4 font-sans text-[2.5rem] font-bold leading-[120%] text-[#0F172A]">Order Complete</h1>
        <p className="mt-2 font-sans text-[1.5rem] font-semibold leading-[140%] text-[#0F172A]">
          You will receive a confirmation email soon!
        </p>
      </div>
    </section>
  );
}

