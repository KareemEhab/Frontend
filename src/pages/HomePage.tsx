import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../api/client";
import { parseApiError } from "../api/errors";
import { clearAuthToken, getAuthToken } from "../auth/token";
import { HeroSection } from "../components/home/HeroSection";
import { MediaGallerySection } from "../components/MediaGallerySection";
import { TopCoursesSection } from "../components/TopCoursesSection";

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
      <HeroSection error={error} user={user ? { first_name: user.first_name, last_name: user.last_name, email: user.email } : null} />

      <MediaGallerySection />

      <TopCoursesSection />
    </div>
  );
}
