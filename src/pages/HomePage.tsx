import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../api/client";
import { parseApiError } from "../api/errors";
import { clearAuthToken, getAuthToken } from "../auth/token";
import { Button } from "../components/Button";
import { MediaGallerySection } from "../components/MediaGallerySection";
import { TopCoursesSection } from "../components/TopCoursesSection";
import heroImage from "../assets/hero.png";

type MeUser = {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export function HomePage() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get<MeUser>("/api/users/me");
        if (!cancelled) {
          setUser(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            clearAuthToken();
            setUser(null);
            setError(null);
            return;
          }
          setError(parseApiError(err));
          setUser(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="font-sans">
      <section className="relative isolate overflow-hidden bg-white pt-[5.625rem] pb-[14.6875rem] pl-[1rem] pr-[1rem] md:pl-[2rem] md:pr-[2rem] lg:px-[8.75rem]">
        <img
          src={heroImage}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[min(90rem,130%)] max-w-[75rem] -translate-x-1/2 -translate-y-1/2 select-none object-contain"
        />

        <div className="relative z-10 w-full max-w-[38rem] text-left">
          <h1 className="max-w-full font-sans text-[2.25rem] font-bold leading-[2.75rem] tracking-tight text-[#0F172A] sm:text-[2.75rem] sm:leading-[3.25rem] lg:text-[3.5rem] lg:leading-[4rem]">
            Better <span className="text-[#00B8FF]">Insights</span> For
            <br />
            Business <span className="text-[#00B8FF]">Growth</span>
          </h1>

          <p className="mt-[0.75rem] w-full max-w-[30rem] font-poppins text-[1rem] font-normal leading-[1.5rem] text-[#777E90]">
            Learn UI-UX Design skills with weekend UX . The latest online
            <br />
            learning system and material that help your knowledge
            <br />
            growing.
          </p>

          <div className="mt-[2.625rem]">
            <Button variant="submitFit" to="/register">
              Get Started
            </Button>
          </div>

          {error ? (
            <p role="alert" className="mt-[1rem] font-sans text-[0.875rem] text-red-500">
              {error}
            </p>
          ) : null}

          {user ? (
            <p className="mt-[1rem] font-sans text-[1rem] leading-[160%] text-slate-800">
              Signed in as{" "}
              <span className="font-semibold text-slate-900">
                {user.first_name} {user.last_name}
              </span>{" "}
              ({user.email})
            </p>
          ) : null}
        </div>
      </section>

      <MediaGallerySection />

      <TopCoursesSection />
    </div>
  );
}
