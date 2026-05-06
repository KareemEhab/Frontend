import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "antd";
import { api } from "../api/client";
import { parseApiError } from "../api/errors";
import { Button } from "./Button";
import { resolveMediaUrl } from "../lib/resolveMediaUrl";
import expandIcon from "../assets/expand.svg";
import arrowLeft from "../assets/arrow-left.svg";
import arrowRight from "../assets/arrow-right.svg";

export type GallerySlide = {
  id: number;
  image: string;
};

function indexForOffset(center: number, offset: number, n: number): number {
  return ((center + offset) % n + n) % n;
}

function tierForOffset(offset: number): { w: string; opacity: number; z: number } {
  const d = Math.abs(offset);
  if (d === 0) return { w: "27.75rem", opacity: 1, z: 30 };
  if (d === 1) return { w: "22.25rem", opacity: 0.8, z: 20 };
  return { w: "17rem", opacity: 0.4, z: 10 };
}

function offsetsForCount(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [0];
  if (n === 2 || n === 3) return [-1, 0, 1];
  if (n === 4) return [-2, -1, 0, 1];
  return [-2, -1, 0, 1, 2];
}

export function MediaGallerySection() {
  const [slides, setSlides] = useState<GallerySlide[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [centerIndex, setCenterIndex] = useState(0);
  const [expandOpen, setExpandOpen] = useState(false);

  const dragStartX = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get<{ Slider: GallerySlide[] }>("/api/gallery");
        const list = [...(data.Slider ?? [])].sort((a, b) => a.id - b.id);
        if (!cancelled) {
          setSlides(list);
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) setLoadError(parseApiError(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = slides.length;

  useEffect(() => {
    if (total > 0 && centerIndex >= total) setCenterIndex(0);
  }, [total, centerIndex]);

  const offsets = useMemo(() => offsetsForCount(total), [total]);

  const goPrev = useCallback(() => {
    if (total < 1) return;
    setCenterIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    if (total < 1) return;
    setCenterIndex((i) => (i + 1) % total);
  }, [total]);

  const resetTrackDragStyles = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transform = "";
    el.style.transition = "";
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (total < 2) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("button")) return;
      dragStartX.current = e.clientX;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [total],
  );

  const endDrag = useCallback(
    (clientX: number) => {
      if (dragStartX.current === null) return;
      const dx = clientX - dragStartX.current;
      dragStartX.current = null;
      resetTrackDragStyles();

      if (dx > 48) {
        goPrev();
        return;
      }
      if (dx < -48) {
        goNext();
        return;
      }
    },
    [goPrev, goNext, resetTrackDragStyles],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      endDrag(e.clientX);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* not the capture target */
      }
    },
    [endDrag],
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent) => {
      dragStartX.current = null;
      resetTrackDragStyles();
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* */
      }
    },
    [resetTrackDragStyles],
  );

  const currentSrc =
    total > 0 ? resolveMediaUrl(slides[centerIndex]?.image ?? "") : "";
  const progressPct = total > 0 ? ((centerIndex + 1) / total) * 100 : 0;

  return (
    <section className="bg-[#E4F8FF] p-[5rem] max-lg:p-8 max-md:p-6">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="max-w-xl shrink-0 lg:max-w-[28rem]">
          <h2 className="font-poppins text-[2.5rem] font-semibold leading-[100%] tracking-normal">
            <span className="text-[#00B8FF]">Check</span>{" "}
            <span className="text-[#2F327D]">our latest Media Gallery</span>
          </h2>
          <p className="mt-[0.625rem] font-poppins text-[1.375rem] font-normal leading-[100%] tracking-[0.02em] text-[#696984]">
            Every picture holds a moment, every moment holds a story
          </p>
          <div className="mt-[2.5rem]">
            <Button variant="submitFit" to="/gallery">
              View all Photos
            </Button>
          </div>
          {loadError ? (
            <p className="mt-4 font-sans text-sm text-red-500" role="alert">
              {loadError}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          {total === 0 && !loadError ? (
            <p className="font-poppins text-[#696984]">No gallery images yet.</p>
          ) : null}

          {total > 0 ? (
            <>
              <div
                className="flex cursor-grab justify-center overflow-x-visible overflow-y-visible px-6 py-4 select-none active:cursor-grabbing sm:px-12"
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                style={{ touchAction: "none" }}
              >
                <div
                  ref={trackRef}
                  className="flex max-w-full items-center justify-center will-change-[margin,width]"
                >
                  {offsets.map((offset, slotIdx) => {
                    const slideIndex = indexForOffset(centerIndex, offset, total);
                    const slide = slides[slideIndex];
                    const { w, opacity, z } = tierForOffset(offset);
                    const src = resolveMediaUrl(slide.image);
                    const isCenter = offset === 0;

                    return (
                      <div
                        key={`slot-${offset}`}
                        className={`relative shrink-0 transition-[width,opacity,margin] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${slotIdx === 0 ? "ml-0" : "-ml-[6rem] sm:-ml-[8.25rem] md:-ml-[9.75rem] lg:-ml-[11.25rem] xl:-ml-[12.5rem]"}`}
                        style={{
                          width: w,
                          height: w,
                          opacity,
                          zIndex: z,
                        }}
                      >
                        <div className="relative h-full w-full overflow-hidden rounded-[1.25rem] bg-slate-200 shadow-sm">
                          <img
                            src={src}
                            alt=""
                            className="h-full w-full object-cover transition-opacity duration-500"
                            draggable={false}
                          />
                          {isCenter ? (
                            <button
                              type="button"
                              className="absolute top-[1.25rem] right-[1.25rem] z-40 flex h-[3.75rem] w-[3.75rem] cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8FF] focus-visible:ring-offset-2"
                              aria-label="Expand image"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandOpen(true);
                              }}
                            >
                              <img src={expandIcon} alt="" width={60} height={60} className="block" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-[1.5rem] flex flex-wrap items-center gap-[1rem]">
                <div className="inline-flex shrink-0 overflow-hidden rounded-full shadow-sm">
                  <button
                    type="button"
                    aria-label="Previous slide"
                    className="flex h-[1.6875rem] w-[2.125rem] shrink-0 cursor-pointer items-center justify-center rounded-none bg-[#00B8FF] transition-opacity hover:opacity-90"
                    onClick={goPrev}
                  >
                    <img src={arrowLeft} alt="" width={20} height={20} className="pointer-events-none block" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next slide"
                    className="flex h-[1.6875rem] w-[2.125rem] shrink-0 cursor-pointer items-center justify-center rounded-none bg-[#00B8FF] transition-opacity hover:opacity-90"
                    onClick={goNext}
                  >
                    <img src={arrowRight} alt="" width={20} height={20} className="pointer-events-none block" />
                  </button>
                </div>
                <div className="relative h-1 min-w-[8rem] flex-1 rounded-full bg-slate-200">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#00B8FF] transition-[width] duration-500 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="shrink-0 font-poppins text-[0.875rem] font-medium tabular-nums leading-[100%] text-[#2F327D]">
                  {centerIndex + 1}/{total}
                </span>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <Modal
        open={expandOpen}
        onCancel={() => setExpandOpen(false)}
        footer={null}
        centered
        width="min(90vw, 56rem)"
        styles={{ root: { padding: 0, overflow: "hidden" }, body: { padding: 0 } }}
        destroyOnHidden
      >
        {currentSrc ? (
          <img src={currentSrc} alt="" className="max-h-[85vh] w-full object-contain" />
        ) : null}
      </Modal>
    </section>
  );
}
