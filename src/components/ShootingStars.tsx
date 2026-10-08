'use client';

import { type CatppuccinColors, flavors } from '@catppuccin/palette';
import { useReducedMotion } from 'motion/react';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useCtpStore } from '@/store';

interface ShootingStar {
  x: number;
  y: number;
  angle: number;
  speed: number;
  distance: number;
  trail: number;
}

interface ShootingStarsProps {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starWidth?: number;
  starHeight?: number;
  className?: string;
}

type Rgb = { r: number; g: number; b: number };

/** Tail → middle → head colors of the three trails a star can leave. */
function trails(colors: CatppuccinColors): [Rgb, Rgb, Rgb][] {
  return [
    [colors.teal.rgb, colors.sapphire.rgb, colors.lavender.rgb],
    [colors.pink.rgb, colors.mauve.rgb, colors.pink.rgb],
    [colors.sky.rgb, colors.blue.rgb, colors.teal.rgb],
  ];
}

const rgba = ({ r, g, b }: Rgb, alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

/** Enters from a random edge, heading diagonally across the viewport. */
function spawn(width: number, height: number, speed: number, trail: number): ShootingStar {
  const side = Math.floor(Math.random() * 4);
  const along = Math.random();
  const start = [
    { x: along * width, y: 0, angle: 45 },
    { x: width, y: along * height, angle: 135 },
    { x: along * width, y: height, angle: 225 },
    { x: 0, y: along * height, angle: 315 },
  ][side]!;
  return { ...start, speed, distance: 0, trail };
}

export const ShootingStars: React.FC<ShootingStarsProps> = ({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  starWidth = 10,
  starHeight = 1,
  className,
}) => {
  const flavor = useCtpStore((state) => state.flavor);
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailsRef = useRef(trails(flavors[flavor].colors));

  useEffect(() => {
    trailsRef.current = trails(flavors[flavor].colors);
  }, [flavor]);

  useEffect(() => {
    // Reduced motion: no shooting stars at all.
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let star: ShootingStar | null = null;
    let frame = 0;
    let timeout = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);
      if (!star) return;

      const radians = (star.angle * Math.PI) / 180;
      star.x += star.speed * Math.cos(radians);
      star.y += star.speed * Math.sin(radians);
      star.distance += star.speed;
      if (star.x < -20 || star.x > width + 20 || star.y < -20 || star.y > height + 20) {
        star = null;
        ctx.clearRect(0, 0, width, height);
        return;
      }

      // The trail stretches the further the star travels.
      const length = starWidth * (1 + star.distance / 100);
      const tailX = star.x - length * Math.cos(radians);
      const tailY = star.y - length * Math.sin(radians);
      const [tail, middle, head] = trailsRef.current[star.trail]!;
      const gradient = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
      gradient.addColorStop(0, rgba(tail, 0));
      gradient.addColorStop(0.5, rgba(middle, 0.5));
      gradient.addColorStop(1, rgba(head, 0.85));

      ctx.strokeStyle = gradient;
      ctx.lineWidth = starHeight;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(star.x, star.y);
      ctx.stroke();

      frame = requestAnimationFrame(step);
    };

    const launch = () => {
      // Background tabs skip a launch; the next one is scheduled regardless.
      if (!document.hidden && !star) {
        star = spawn(
          width,
          height,
          Math.random() * (maxSpeed - minSpeed) + minSpeed,
          Math.floor(Math.random() * 3)
        );
        frame = requestAnimationFrame(step);
      }
      timeout = window.setTimeout(launch, Math.random() * (maxDelay - minDelay) + minDelay);
    };

    const onVisibilityChange = () => {
      if (!document.hidden) return;
      cancelAnimationFrame(frame);
      star = null;
      ctx.clearRect(0, 0, width, height);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    document.addEventListener('visibilitychange', onVisibilityChange);
    launch();

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      // Don't leave a star frozen mid-flight if motion gets reduced.
      ctx.clearRect(0, 0, width, height);
    };
  }, [reduceMotion, minSpeed, maxSpeed, minDelay, maxDelay, starWidth, starHeight]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  );
};

export default ShootingStars;
