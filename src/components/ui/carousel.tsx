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

const CarouselContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const { carouselRef, orientation, canScrollPrev, canScrollNext } = useCarousel();

  // Only fade an edge when there's actually content scrolled away on that side,
  // so the first card is never dimmed at the start. When a card is hovered
  // (`:has(.group:hover)`) the mask is dropped entirely so a card sitting under
  // a fade becomes fully legible. The four combinations are enumerated as
  // static class strings so Tailwind's compiler can see them.
  const MASKS = {
    'false-false': '[mask-image:none]',
    'true-false':
      '[mask-image:linear-gradient(to_right,transparent,black_7%,black_100%)] [&:has(.group:hover)]:[mask-image:none]',
    'false-true':
      '[mask-image:linear-gradient(to_right,black_0%,black_93%,transparent)] [&:has(.group:hover)]:[mask-image:none]',
    'true-true':
      '[mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)] [&:has(.group:hover)]:[mask-image:none]',
  } as const;
  const maskClass =
    orientation === 'horizontal'
      ? MASKS[`${canScrollPrev}-${canScrollNext}` as keyof typeof MASKS]
      : '';

  return (
    <div ref={carouselRef} className={cn('overflow-hidden', maskClass)}>
      <div
        className={cn('flex', orientation === 'horizontal' ? '-ml-6' : '-mt-6 flex-col', className)}
        {...props}
      />
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

const CarouselPrevious = ({ className, ...props }: HTMLAttributes<HTMLButtonElement>) => {
  const { scrollPrev, canScrollPrev } = useCarousel();

  return (
    <button
      type="button"
      aria-label="Previous slide"
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      className={cn(
        'absolute left-0 top-1/2 z-30 -translate-y-1/2 text-ctp-subtext0/60 transition-colors hover:text-ctp-text disabled:pointer-events-none disabled:opacity-0',
        className
      )}
      {...props}
    >
      <ChevronLeftIcon className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.5} />
      <span className="sr-only">Previous slide</span>
    </button>
  );
};

const CarouselNext = ({ className, ...props }: HTMLAttributes<HTMLButtonElement>) => {
  const { scrollNext, canScrollNext } = useCarousel();

  return (
    <button
      type="button"
      aria-label="Next slide"
      disabled={!canScrollNext}
      onClick={scrollNext}
      className={cn(
        'absolute right-0 top-1/2 z-30 -translate-y-1/2 text-ctp-subtext0/60 transition-colors hover:text-ctp-text disabled:pointer-events-none disabled:opacity-0',
        className
      )}
      {...props}
    >
      <ChevronRightIcon className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.5} />
      <span className="sr-only">Next slide</span>
    </button>
  );
};

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
