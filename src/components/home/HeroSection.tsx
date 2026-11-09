import heroImage from "../../assets/hero.png";
import { Button } from "../Button";

type Props = {
  error: string | null;
  user:
    | {
        first_name: string;
        last_name: string;
        email: string;
      }
    | null;
};

export function HeroSection({ error, user }: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-white pt-22.5 pb-58.75 px-4 md:px-8 lg:px-35">
      <img
        src={heroImage}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[min(90rem,130%)] max-w-300 -translate-x-1/2 -translate-y-1/2 select-none object-contain"
      />

      <div className="relative z-10 w-full max-w-152 text-left">
        <h1 className="max-w-full font-sans text-[2.25rem] font-bold leading-11 tracking-tight text-[#0F172A] sm:text-[2.75rem] sm:leading-13 lg:text-[3.5rem] lg:leading-16">
          Better <span className="text-[#00B8FF]">Insights</span> For
          <br />
          Business <span className="text-[#00B8FF]">Growth</span>
        </h1>

        <p className="mt-3 w-full max-w-120 font-poppins text-[1rem] font-normal leading-6 text-[#777E90]">
          Learn UI-UX Design skills with weekend UX . The latest online learning system and material that help your knowledge growing.
        </p>

        <div className="mt-10.5">
          <Button variant="submitFit" to="/register">
            Get Started
          </Button>
        </div>

        {error ? (
          <p role="alert" className="mt-4 font-sans text-[0.875rem] text-red-500">
            {error}
          </p>
        ) : null}

        {user ? (
          <p className="mt-4 font-sans text-[1rem] leading-[160%] text-slate-800">
            Signed in as{" "}
            <span className="font-semibold text-slate-900">
              {user.first_name} {user.last_name}
            </span>{" "}
            ({user.email})
          </p>
        ) : null}
      </div>
    </section>
  );
}

