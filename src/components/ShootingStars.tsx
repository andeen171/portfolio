'use client';

import { cn } from '@/lib/utils';
import { useCtpStore } from '@/store';
import { type CatppuccinColors, flavors } from '@catppuccin/palette';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
}

interface ShootingStarsProps {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starColor?: string;
  trailColor?: string;
  starWidth?: number;
  starHeight?: number;
  className?: string;
}

const getRandomStartPoint = () => {
  const side = Math.floor(Math.random() * 4);
  const offset = Math.random() * window.innerWidth;

  switch (side) {
    case 0:
      return { x: offset, y: 0, angle: 45 };
    case 1:
      return { x: window.innerWidth, y: offset, angle: 135 };
    case 2:
      return { x: offset, y: window.innerHeight, angle: 225 };
    case 3:
      return { x: 0, y: offset, angle: 315 };
    default:
      return { x: 0, y: 0, angle: 45 };
  }
};
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
  const [colors, setColors] = useState<CatppuccinColors>(flavors[flavor].colors);
  const [star, setStar] = useState<ShootingStar | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Update colors when flavor changes
  useEffect(() => {
    setColors(flavors[flavor].colors);
  }, [flavor]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const createStar = () => {
      const { x, y, angle } = getRandomStartPoint();
      const newStar: ShootingStar = {
        id: Date.now(),
        x,
        y,
        angle,
        scale: 1,
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        distance: 0,
      };
      setStar(newStar);

      const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
      timeoutId = setTimeout(createStar, randomDelay);
    };

    createStar();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [minSpeed, maxSpeed, minDelay, maxDelay]);

  useEffect(() => {
    const moveStar = () => {
      if (star) {
        setStar((prevStar) => {
          if (!prevStar) return null;
          const newX = prevStar.x + prevStar.speed * Math.cos((prevStar.angle * Math.PI) / 180);
          const newY = prevStar.y + prevStar.speed * Math.sin((prevStar.angle * Math.PI) / 180);
          const newDistance = prevStar.distance + prevStar.speed;
          const newScale = 1 + newDistance / 100;
          if (
            newX < -20 ||
            newX > window.innerWidth + 20 ||
            newY < -20 ||
            newY > window.innerHeight + 20
          ) {
            return null;
          }
          return {
            ...prevStar,
            x: newX,
            y: newY,
            distance: newDistance,
            scale: newScale,
          };
        });
      }
    };

    const animationFrame = requestAnimationFrame(moveStar);
    return () => cancelAnimationFrame(animationFrame);
  }, [star]);

  return (
    <svg
      ref={svgRef}
      className={cn('w-full h-full absolute inset-0 pointer-events-none', className)}
    >
      <title>Shooting Stars</title>
      {star && (
        <rect
          key={star.id}
          x={star.x}
          y={star.y}
          width={starWidth * star.scale}
          height={starHeight}
          fill={`url(#gradient${star.id % 3})`}
          transform={`rotate(${star.angle}, ${star.x + (starWidth * star.scale) / 2}, ${
            star.y + starHeight / 2
          })`}
          opacity={0.8}
        />
      )}
      <defs>
        <linearGradient id="gradient0" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{
              stopColor: `rgb(${colors.teal.rgb.r}, ${colors.teal.rgb.g}, ${colors.teal.rgb.b})`,
              stopOpacity: 0,
            }}
          />
          <stop
            offset="50%"
            style={{
              stopColor: `rgb(${colors.sapphire.rgb.r}, ${colors.sapphire.rgb.g}, ${colors.sapphire.rgb.b})`,
              stopOpacity: 0.6,
            }}
          />
          <stop
            offset="100%"
            style={{
              stopColor: `rgb(${colors.lavender.rgb.r}, ${colors.lavender.rgb.g}, ${colors.lavender.rgb.b})`,
              stopOpacity: 1,
            }}
          />
        </linearGradient>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{
              stopColor: `rgb(${colors.pink.rgb.r}, ${colors.pink.rgb.g}, ${colors.pink.rgb.b})`,
              stopOpacity: 0,
            }}
          />
          <stop
            offset="50%"
            style={{
              stopColor: `rgb(${colors.mauve.rgb.r}, ${colors.mauve.rgb.g}, ${colors.mauve.rgb.b})`,
              stopOpacity: 0.6,
            }}
          />
          <stop
            offset="100%"
            style={{
              stopColor: `rgb(${colors.pink.rgb.r}, ${colors.pink.rgb.g}, ${colors.pink.rgb.b})`,
              stopOpacity: 1,
            }}
          />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{
              stopColor: `rgb(${colors.sky.rgb.r}, ${colors.sky.rgb.g}, ${colors.sky.rgb.b})`,
              stopOpacity: 0,
            }}
          />
          <stop
            offset="50%"
            style={{
              stopColor: `rgb(${colors.blue.rgb.r}, ${colors.blue.rgb.g}, ${colors.blue.rgb.b})`,
              stopOpacity: 0.6,
            }}
          />
          <stop
            offset="100%"
            style={{
              stopColor: `rgb(${colors.teal.rgb.r}, ${colors.teal.rgb.g}, ${colors.teal.rgb.b})`,
              stopOpacity: 1,
            }}
          />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default ShootingStars;
