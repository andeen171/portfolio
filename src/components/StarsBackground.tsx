'use client';

import { type CatppuccinColors, flavors } from '@catppuccin/palette';
import { useReducedMotion } from 'motion/react';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useCtpStore } from '@/store';

interface Star {
  /** Position as a fraction of the canvas, so a resize stretches the sky instead of reshuffling it. */
  x: number;
  y: number;
  radius: number;
  opacity: number;
  /** Seconds per twinkle, or null for a steady star. */
  twinkleSpeed: number | null;
  /** Offsets the twinkle so stars don't pulse in unison. */
  phase: number;
  parallaxSpeed: number;
  colorIndex: number;
}

interface StarBackgroundProps {
  starDensity?: number;
  allStarsTwinkle?: boolean;
  twinkleProbability?: number;
  minTwinkleSpeed?: number;
  maxTwinkleSpeed?: number;
  className?: string;
}

/** `r, g, b` triplets and an alpha multiplier per star color. */
function starPalette(colors: CatppuccinColors) {
  const swatch = (name: keyof CatppuccinColors, alpha: number) => {
    const { r, g, b } = colors[name].rgb;
    return { rgb: `${r}, ${g}, ${b}`, alpha };
  };
  return [
    swatch('lavender', 0.9),
    swatch('teal', 0.8),
    swatch('pink', 0.7),
    swatch('sky', 0.8),
    swatch('sapphire', 0.9),
    swatch('blue', 0.8),
  ];
}

export const StarsBackground: React.FC<StarBackgroundProps> = ({
  starDensity = 0.00015,
  allStarsTwinkle = true,
  twinkleProbability = 0.8,
  minTwinkleSpeed = 0.8,
  maxTwinkleSpeed = 2.0,
  className,
}) => {
  const flavor = useCtpStore((state) => state.flavor);
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef(starPalette(flavors[flavor].colors));
  // Repaints one frame; the sky's effect points it at its current closure.
  const repaintRef = useRef<() => void>(() => {});

  useEffect(() => {
    paletteRef.current = starPalette(flavors[flavor].colors);
    repaintRef.current();
  }, [flavor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Reduced motion: a still sky, painted on demand, no twinkle or parallax.
    const animate = !reduceMotion;
    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;

    const createStar = (): Star => {
      const shouldTwinkle = allStarsTwinkle || Math.random() < twinkleProbability;
      return {
        x: Math.random(),
        y: Math.random(),
        radius: Math.random() * 1.2 + 0.4,
        opacity: Math.random() * 0.4 + 0.3,
        twinkleSpeed: shouldTwinkle
          ? minTwinkleSpeed + Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
          : null,
        phase: Math.random() * Math.PI * 2,
        parallaxSpeed: Math.random() * 0.5 + 0.1,
        colorIndex: Math.floor(Math.random() * 6),
      };
    };

    const paint = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const palette = paletteRef.current;
      const scrollY = animate ? window.scrollY : 0;

      for (const star of stars) {
        // Parallax with wrap-around: deeper stars drift slower as you scroll.
        let y = (star.y * height - scrollY * star.parallaxSpeed) % height;
        if (y < 0) y += height;
        const x = star.x * width;

        const opacity =
          animate && star.twinkleSpeed !== null
            ? 0.2 + Math.abs(Math.sin((time * 0.001) / star.twinkleSpeed + star.phase) * 0.4)
            : star.opacity;
        const { rgb, alpha } = palette[star.colorIndex % palette.length]!;

        // A faint halo instead of shadowBlur, which is costly per frame.
        if (star.radius > 0.8) {
          ctx.beginPath();
          ctx.arc(x, y, star.radius * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb}, ${opacity * alpha * 0.18})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(x, y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${opacity * alpha})`;
        ctx.fill();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === width && rect.height === height) return;
      width = rect.width;
      height = rect.height;
      // Crisp on high-density screens; capped, since stars don't need 3x.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Keep the existing sky; only top up or trim to the new area's count.
      const count = Math.floor(width * height * starDensity);
      if (stars.length > count) stars = stars.slice(0, count);
      while (stars.length < count) stars.push(createStar());
      paint(performance.now());
    };

    const loop = (time: number) => {
      paint(time);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!animate || running || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };
    // Nobody watches the sky in a background tab.
    const onVisibilityChange = () => (document.hidden ? stop() : start());

    repaintRef.current = () => paint(performance.now());
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    document.addEventListener('visibilitychange', onVisibilityChange);
    start();

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      repaintRef.current = () => {};
    };
  }, [
    reduceMotion,
    starDensity,
    allStarsTwinkle,
    twinkleProbability,
    minTwinkleSpeed,
    maxTwinkleSpeed,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  );
};

export default StarsBackground;
