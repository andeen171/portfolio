'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProjectGalleryProps {
  /** `label` names the slide and its dot: "Image 2 of 4". */
  slides: { src: string; alt: string; label: string }[];
  labels: {
    region: string;
    roleDescription: string;
    previous: string;
    next: string;
  };
  className?: string;
}

const arrow =
  'absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-ctp-crust/70 text-ctp-text ring-1 ring-ctp-surface1 backdrop-blur-md transition hover:bg-ctp-crust/90 hover:ring-ctp-lavender/70 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender sm:opacity-0 sm:group-hover:opacity-100 motion-reduce:transition-none';

/**
 * A project's screenshots as a swipeable, looping strip inside the cover
 * frame: arrows on hover (always on touch screens), dots to jump, and a
 * counter. Every shot loads lazily, the hidden ones as they slide in.
 */
export default function ProjectGallery({ slides, labels, className }: ProjectGalleryProps) {
  const [viewportRef, api] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect).on('reInit', onSelect);
    return () => {
      api.off('select', onSelect).off('reInit', onSelect);
    };
  }, [api]);

  return (
    <section
      aria-label={labels.region}
      aria-roledescription={labels.roleDescription}
      className={cn('relative', className)}
    >
      <div ref={viewportRef} className="absolute inset-0 overflow-hidden">
        <div className="flex h-full touch-pan-y">
          {slides.map((slide) => (
            <div key={slide.src} className="relative h-full min-w-0 flex-[0_0_100%]">
              {/* biome-ignore lint/performance/noImgElement: the Sanity CDN already resizes and re-encodes it */}
              <img
                src={slide.src}
                alt={slide.alt}
                width={960}
                height={540}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Seats the screenshots in the card instead of ending in a hard edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-ctp-crust/60 via-transparent to-transparent"
      />

      <button
        type="button"
        onClick={() => api?.scrollPrev()}
        aria-label={labels.previous}
        className={cn(arrow, 'left-3')}
      >
        <ChevronLeftIcon aria-hidden="true" className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => api?.scrollNext()}
        aria-label={labels.next}
        className={cn(arrow, 'right-3')}
      >
        <ChevronRightIcon aria-hidden="true" className="size-5" />
      </button>

      <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-1.5">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => api?.scrollTo(index)}
            aria-label={slide.label}
            aria-current={index === selected ? 'true' : undefined}
            className="group/dot flex h-6 items-center px-0.5 focus-visible:outline-none"
          >
            <span
              className={cn(
                'block h-1.5 rounded-full bg-ctp-text/50 ring-ctp-lavender transition-all duration-300 group-focus-visible/dot:ring-2 motion-reduce:transition-none',
                index === selected ? 'w-5 bg-ctp-text' : 'w-1.5 hover:bg-ctp-text/80'
              )}
            />
          </button>
        ))}
      </div>

      <span className="absolute top-3 right-3 z-10 rounded-full bg-ctp-crust/70 px-2 py-0.5 font-nf text-[0.625rem] text-ctp-subtext1 ring-1 ring-ctp-surface1 backdrop-blur-md">
        {selected + 1}/{slides.length}
      </span>
    </section>
  );
}
