'use client';

import { useEffect, useRef, useState } from 'react';
import {
  acquireLiveCanvas,
  type FoilParams,
  isFoilShaderAvailable,
  type LiveHandle,
  renderFoilTexture,
} from '@/lib/foilShader';
import { hashString } from '@/lib/hash';
import { type Hsl, hslToRgbUnit } from '@/lib/logoColor';
import { cn } from '@/lib/utils';
import { useCtpStore } from '@/store';
import FoilLayer from './FoilLayer';

/**
 * The real foil: a thin-film interference shader, painted inside a skill card's
 * art window.
 *
 * The grid renders 66 of these and browsers cap live WebGL contexts around 16,
 * so no card owns a context. A card is a *static frame* — one shader draw baked
 * to a data URL — until the pointer enters it, at which point the shared canvas
 * moves in and animates. See `@/lib/foilShader` for the mechanics.
 *
 * The static frame is only drawn once the card nears the viewport, so opening
 * `/skills` costs draws for the first screenful rather than all 66 at once.
 *
 * Where WebGL is unavailable (blocked GPU, old driver, context loss) this falls
 * back to {@link FoilLayer}, the CSS foil — a real fallback, not a blank box.
 */
export const FoilShader = ({
  className,
  seed,
  logoHsl,
}: {
  className?: string;
  /** Stable per-skill string — usually the document `_id`. */
  seed: string;
  /** Dominant logo colour, when the logo has one; biases the interference. */
  logoHsl?: Hsl | null;
}) => {
  const flavor = useCtpStore((state) => state.flavor);
  const isLightTheme = flavor === 'latte';

  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<LiveHandle | null>(null);
  const [texture, setTexture] = useState<string | null>(null);
  // Starts null (unknown) so the first paint commits to neither branch and SSR
  // matches the client; resolved in an effect.
  const [supported, setSupported] = useState<boolean | null>(null);

  // Tint biases the foil toward the logo's own colour. With no logo colour we
  // use a neutral one and let the interference show its full spectrum.
  const tint: [number, number, number] = logoHsl
    ? hslToRgbUnit({ h: logoHsl.h, s: Math.min(1, logoHsl.s + 0.15), l: 0.6 })
    : [0.75, 0.8, 0.95];

  const paramsRef = useRef<FoilParams>({ seed: 0, tint, isLightTheme });
  paramsRef.current = {
    seed: (hashString(seed) % 1000) / 1000,
    tint,
    isLightTheme,
  };

  // Bake the resting frame once the card is near the viewport. Re-runs on
  // flavor change, because latte needs a different exposure.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (!isFoilShaderAvailable()) {
      setSupported(false);
      return;
    }
    setSupported(true);

    let done = false;
    const bake = () => {
      if (done) return;
      done = true;
      const url = renderFoilTexture(`${seed}:${flavor}`, paramsRef.current);
      if (url) setTexture(url);
      else setSupported(false);
    };

    if (typeof IntersectionObserver === 'undefined') {
      bake();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          bake();
          observer.disconnect();
        }
      },
      // A screenful of margin, so a card is painted before it scrolls in rather
      // than popping once it arrives.
      { rootMargin: '600px' }
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [seed, flavor]);

  // Hover is tracked on the art window (this layer's parent) rather than on the
  // layer itself: the icon sits above the foil as a sibling, so listening here
  // would fire `pointerleave` the moment the pointer crossed onto the icon.
  useEffect(() => {
    const window_ = hostRef.current?.parentElement;
    const stage = stageRef.current;
    if (!window_ || !stage || supported === false) return;

    const enter = () => {
      if (liveRef.current) return;
      liveRef.current = acquireLiveCanvas(stage, paramsRef.current);
    };

    const move = (event: PointerEvent) => {
      const live = liveRef.current;
      if (!live) return;
      const rect = stage.getBoundingClientRect();
      live.setPointer(
        (event.clientX - rect.left) / rect.width,
        // GL's origin is bottom-left; the DOM's is top-left.
        1 - (event.clientY - rect.top) / rect.height
      );
    };

    const leave = () => {
      liveRef.current?.release();
      liveRef.current = null;
    };

    window_.addEventListener('pointerenter', enter);
    window_.addEventListener('pointermove', move);
    window_.addEventListener('pointerleave', leave);
    window_.addEventListener('pointercancel', leave);

    return () => {
      window_.removeEventListener('pointerenter', enter);
      window_.removeEventListener('pointermove', move);
      window_.removeEventListener('pointerleave', leave);
      window_.removeEventListener('pointercancel', leave);
      leave();
    };
  }, [supported]);

  if (supported === false) {
    return <FoilLayer className={className} seed={seed} />;
  }

  return (
    <div
      aria-hidden
      ref={hostRef}
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {/* A dark seat so light icons keep contrast wherever the foil is pale. */}
      <div className="absolute inset-0 bg-ctp-crust/70" />
      {/* Both the baked frame and the live canvas land in here, so the swap
          between them doesn't change how the foil composites. */}
      <div
        ref={stageRef}
        className={cn(
          'absolute inset-0 bg-cover bg-center transition-opacity duration-500',
          texture ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          backgroundImage: texture ? `url(${texture})` : undefined,
          mixBlendMode: isLightTheme ? 'soft-light' : 'screen',
          // Well under 1: the shader is the base sheen every card gets, and the
          // rarity foil has to be able to read *over* it. At 0.95 on `screen`
          // the window blew out and every tier looked the same.
          opacity: texture ? (isLightTheme ? 0.45 : 0.6) : 0,
        }}
      />
    </div>
  );
};

export default FoilShader;
