import { useEffect, useState } from "react";
import { api } from "../api/client";
import { parseApiError } from "../api/errors";
import type { GallerySlide } from "../components/MediaGallerySection";
import { resolveMediaUrl } from "../lib/resolveMediaUrl";

export function GalleryPage() {
  const [slides, setSlides] = useState<GallerySlide[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get<{ Slider: GallerySlide[] }>("/api/gallery");
        const list = [...(data.Slider ?? [])].sort((a, b) => a.id - b.id);
        if (!cancelled) {
          setSlides(list);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(parseApiError(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-[0.875rem] py-12 font-sans">
      <h1 className="font-poppins text-2xl font-semibold text-[#2F327D]">Gallery</h1>
      {error ? (
        <p className="mt-4 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {slides.map((slide) => (
          <li key={slide.id} className="aspect-square overflow-hidden rounded-[1.25rem] bg-slate-100">
            <img
              src={resolveMediaUrl(slide.image)}
              alt=""
              className="h-full w-full object-cover"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
