import { cn } from '@/lib/utils';
import { useCtpStore } from '@/store';
import { type CatppuccinColors, flavors } from '@catppuccin/palette';
import React, { RefObject, useCallback, useEffect, useRef, useState } from 'react';

interface StarProps {
  x: number;
  y: number;
  initialY: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number | null;
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

export const StarsBackground: React.FC<StarBackgroundProps> = ({
  starDensity = 0.00008,
  allStarsTwinkle = true,
  twinkleProbability = 0.8,
  minTwinkleSpeed = 0.8,
  maxTwinkleSpeed = 2.0,
  className,
}) => {
  const flavor = useCtpStore((state) => state.flavor);
  const [stars, setStars] = useState<StarProps[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const [colors, setColors] = useState<CatppuccinColors>(flavors[flavor].colors);
  const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);

  // Update colors when flavor changes
  useEffect(() => {
    setColors(flavors[flavor].colors);
  }, [flavors[flavor]]);

  const getStarColor = (colorIndex: number, opacity: number): string => {
    const starColors = [
      `rgba(${colors.lavender.rgb.r}, ${colors.lavender.rgb.g}, ${colors.lavender.rgb.b}, ${
        opacity * 0.9
      })`,
      `rgba(${colors.teal.rgb.r}, ${colors.teal.rgb.g}, ${colors.teal.rgb.b}, ${opacity * 0.8})`,
      `rgba(${colors.pink.rgb.r}, ${colors.pink.rgb.g}, ${colors.pink.rgb.b}, ${opacity * 0.7})`,
      `rgba(${colors.sky.rgb.r}, ${colors.sky.rgb.g}, ${colors.sky.rgb.b}, ${opacity * 0.8})`,
      `rgba(${colors.sapphire.rgb.r}, ${colors.sapphire.rgb.g}, ${colors.sapphire.rgb.b}, ${
        opacity * 0.9
      })`,
      `rgba(${colors.blue.rgb.r}, ${colors.blue.rgb.g}, ${colors.blue.rgb.b}, ${opacity * 0.8})`,
    ];
    return starColors[colorIndex % starColors.length]!;
  };

  const generateStars = useCallback(
    (width: number, height: number): StarProps[] => {
      const area = width * (height + 1000); // Extra height for parallax
      const numStars = Math.floor(area * starDensity);
      return Array.from({ length: numStars }, (_) => {
        const shouldTwinkle = allStarsTwinkle || Math.random() < twinkleProbability;
        const y = Math.random() * (height + 1000) - 500;
        return {
          x: Math.random() * width,
          y,
          initialY: y,
          radius: Math.random() * 1.2 + 0.4,
          opacity: Math.random() * 0.4 + 0.3,
          twinkleSpeed: shouldTwinkle
            ? minTwinkleSpeed + Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
            : null,
          parallaxSpeed: Math.random() * 0.5 + 0.2,
          colorIndex: Math.floor(Math.random() * 6),
        };
      });
    },
    [starDensity, allStarsTwinkle, twinkleProbability, minTwinkleSpeed, maxTwinkleSpeed]
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateStars = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        setStars(generateStars(width, height));
      }
    };

    updateStars();

    const resizeObserver = new ResizeObserver(updateStars);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      if (canvasRef.current) {
        resizeObserver.unobserve(canvasRef.current);
      }
    };
  }, [generateStars]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // biome-ignore lint/complexity/noForEach: <explanation>
      stars.forEach((star) => {
        // Apply parallax effect
        const parallaxY = star.initialY + scrollY * star.parallaxSpeed;

        // Skip stars that are out of view
        if (parallaxY < -50 || parallaxY > canvas.height + 50) return;

        ctx.beginPath();
        ctx.arc(star.x, parallaxY, star.radius, 0, Math.PI * 2);

        const color = getStarColor(star.colorIndex, star.opacity);
        ctx.fillStyle = color;

        // Add subtle glow for larger stars
        if (star.radius > 0.8) {
          ctx.shadowColor = color;
          ctx.shadowBlur = star.radius * 2;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fill();
        }

        // Update twinkle
        if (star.twinkleSpeed !== null) {
          star.opacity = 0.2 + Math.abs(Math.sin((Date.now() * 0.001) / star.twinkleSpeed) * 0.4);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stars, scrollY, colors]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('h-full w-full absolute inset-0 pointer-events-none', className)}
    />
  );
};

export default StarsBackground;
