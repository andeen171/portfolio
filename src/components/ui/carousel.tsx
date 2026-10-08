'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import {
  createContext,
  type HTMLAttributes,
  type KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

const Carousel = ({
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & CarouselProps) => {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  useEffect(() => {
    if (!api) return;
    // Measure once the API is live, then keep the arrow state in sync with
    // every embla event that can change scrollability: pointer/programmatic
    // selection, re-inits (resize, remount), and changes to the slide set.
    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);
    api.on('slidesChanged', onSelect);

    return () => {
      api?.off('reInit', onSelect);
      api?.off('select', onSelect);
      api?.off('slidesChanged', onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <section
        onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        aria-label="Skills carousel"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  );
};

/** Width of each edge fade, as a fraction of the viewport. Matches the 7% in
 *  `.carousel-viewport` (globals.css). */
const EDGE_FADE = 0.07;

const CarouselContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const { carouselRef, api, orientation, canScrollPrev, canScrollNext } = useCarousel();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  // Which edge fades are held back because the active card sits under them.
  const [reveal, setReveal] = useState({ start: false, end: false });

  const setViewport = useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node;
      carouselRef(node);
    },
    [carouselRef]
  );

  // An edge fades only when there's content scrolled away on that side, so
  // the first card is never dimmed at the start. When a card under a fade
  // becomes active (hovered), that one fade eases out so the card is
  // fully legible; the opposite edge keeps its fade.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || orientation !== 'horizontal') return;

    const update = () => {
      const active = viewport.querySelector('[data-active]');
      let start = false;
      let end = false;
      if (active) {
        const view = viewport.getBoundingClientRect();
        const card = active.getBoundingClientRect();
        const fade = view.width * EDGE_FADE;
        start = card.left < view.left + fade;
        end = card.right > view.right - fade;
      }
      setReveal((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    };

    const observer = new MutationObserver(update);
    observer.observe(viewport, { subtree: true, attributeFilter: ['data-active'] });
    api?.on('scroll', update);
    return () => {
      observer.disconnect();
      api?.off('scroll', update);
    };
  }, [api, orientation]);

  const horizontal = orientation === 'horizontal';

  return (
    <div
      ref={setViewport}
      data-fade-start={(horizontal && canScrollPrev && !reveal.start) || undefined}
      data-fade-end={(horizontal && canScrollNext && !reveal.end) || undefined}
      className={cn('overflow-hidden', horizontal && 'carousel-viewport')}
    >
      <div className={cn('flex', horizontal ? '-ml-6' : '-mt-6 flex-col', className)} {...props} />
    </div>
  );
};

const CarouselItem = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const { orientation } = useCarousel();

  return (
    <div
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-6' : 'pt-6',
        className
      )}
      {...props}
    />
  );
};

const NAV_BUTTON =
  'inline-flex size-10 items-center justify-center rounded-full border border-ctp-surface1 bg-ctp-mantle/70 text-ctp-subtext1 backdrop-blur-sm transition-colors hover:border-ctp-lavender hover:text-ctp-lavender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender/50 disabled:pointer-events-none disabled:opacity-35';

// Callers pass a localized `label`; it drives both aria-label and the
// sr-only text so the two never disagree across locales.
const CarouselPrevious = ({
  className,
  label,
  ...props
}: HTMLAttributes<HTMLButtonElement> & { label: string }) => {
  const { scrollPrev, canScrollPrev } = useCarousel();

  return (
    <button
      type="button"
      aria-label={label}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      className={cn(NAV_BUTTON, className)}
      {...props}
    >
      <ChevronLeftIcon className="size-5" strokeWidth={2} />
      <span className="sr-only">{label}</span>
    </button>
  );
};

const CarouselNext = ({
  className,
  label,
  ...props
}: HTMLAttributes<HTMLButtonElement> & { label: string }) => {
  const { scrollNext, canScrollNext } = useCarousel();

  return (
    <button
      type="button"
      aria-label={label}
      disabled={!canScrollNext}
      onClick={scrollNext}
      className={cn(NAV_BUTTON, className)}
      {...props}
    >
      <ChevronRightIcon className="size-5" strokeWidth={2} />
      <span className="sr-only">{label}</span>
    </button>
  );
};

/**
 * A scrollbar-like track: the thumb's width is the share of the row in view,
 * its position how far the row is scrolled. Hidden when everything fits.
 */
const CarouselProgress = ({ className }: { className?: string }) => {
  const { api, canScrollPrev, canScrollNext } = useCarousel();
  const [progress, setProgress] = useState(0);
  const [thumb, setThumb] = useState(1);

  useEffect(() => {
    if (!api) return;
    const measure = () => {
      const content = api.containerNode().scrollWidth;
      setThumb(content ? Math.min(1, api.rootNode().clientWidth / content) : 1);
    };
    const update = () => setProgress(Math.min(1, Math.max(0, api.scrollProgress())));
    measure();
    update();
    api.on('scroll', update);
    api.on('reInit', measure);
    api.on('reInit', update);
    return () => {
      api.off('scroll', update);
      api.off('reInit', measure);
      api.off('reInit', update);
    };
  }, [api]);

  if (!canScrollPrev && !canScrollNext) return <div className={className} />;

  return (
    <div aria-hidden className={cn('h-1 overflow-hidden rounded-full bg-ctp-surface0', className)}>
      <div
        className="h-full rounded-full bg-linear-to-r from-ctp-teal to-ctp-lavender transition-[width] duration-300"
        style={{
          width: `${thumb * 100}%`,
          translate: `${(progress * (1 - thumb) * 100) / thumb}% 0`,
        }}
      />
    </div>
  );
};

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselProgress,
};
