import { cn } from '@/lib/utils';
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
  const [stars, setStars] = useState<StarProps[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);

  const getStarColor = (colorIndex: number, opacity: number): string => {
    const colors = [
      `rgba(203, 166, 247, ${opacity * 0.9})`, // lavender
      `rgba(148, 226, 213, ${opacity * 0.8})`, // teal
      `rgba(245, 194, 231, ${opacity * 0.7})`, // pink
      `rgba(137, 220, 235, ${opacity * 0.8})`, // sky
      `rgba(116, 199, 236, ${opacity * 0.9})`, // sapphire
      `rgba(180, 190, 254, ${opacity * 0.8})`, // blue
    ];
    return colors[colorIndex % colors.length]!;
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
  }, [stars, scrollY]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('h-full w-full absolute inset-0 pointer-events-none', className)}
    />
  );
};

export default StarsBackground;
