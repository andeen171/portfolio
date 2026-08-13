'use client';

import { type CatppuccinColors, flavors } from '@catppuccin/palette';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useCtpStore } from '@/store';

export type GlareCardAccent = 'teal' | 'lavender' | 'pink' | 'peach' | 'green' | 'sky';

// Static class strings (not built dynamically) so Tailwind's compiler can see them.
const ACCENT_BORDER: Record<GlareCardAccent, string> = {
  teal: 'border-ctp-teal/60 hover:shadow-ctp-teal/30',
  lavender: 'border-ctp-lavender/60 hover:shadow-ctp-lavender/30',
  pink: 'border-ctp-pink/60 hover:shadow-ctp-pink/30',
  peach: 'border-ctp-peach/60 hover:shadow-ctp-peach/30',
  green: 'border-ctp-green/60 hover:shadow-ctp-green/30',
  sky: 'border-ctp-sky/60 hover:shadow-ctp-sky/30',
};

export const GlareCard = ({
  children,
  className,
  accent,
  active = false,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: GlareCardAccent;
  /** Force the hovered/active visual state without a pointer hover — used for
   *  tap-to-activate on touch devices. */
  active?: boolean;
}) => {
  const flavor = useCtpStore((state) => state.flavor);
  const [colors, setColors] = useState<CatppuccinColors>(flavors[flavor].colors);
  const [isActive, setIsActive] = useState(false);
  const isPointerInside = useRef(false);
  const refElement = useRef<HTMLDivElement>(null);
  const state = useRef({
    glare: {
      x: 50,
      y: 50,
    },
    background: {
      x: 50,
      y: 50,
    },
    rotate: {
      x: 0,
      y: 0,
    },
  });

  useEffect(() => {
    setColors(flavors[flavor].colors);
  }, [flavor]);

  const isLightTheme = flavor === 'latte';
  // The full-card glare highlight is kept faint, and fainter still on latte so
  // the card content behind it stays readable at all times.
  const glareMultiplier = isLightTheme ? 0.4 : 0.7;

  const containerStyle = {
    '--m-x': '50%',
    '--m-y': '50%',
    '--r-x': '0deg',
    '--r-y': '0deg',
    '--bg-x': '50%',
    '--bg-y': '50%',
    '--duration': '300ms',
    '--foil-size': '100%',
    '--radius': '16px',
    '--easing': 'ease',
    '--transition': 'var(--duration) var(--easing)',
  } as React.CSSProperties;

  const updateStyles = () => {
    if (refElement.current) {
      const { background, rotate, glare } = state.current;
      refElement.current?.style.setProperty('--m-x', `${glare.x}%`);
      refElement.current?.style.setProperty('--m-y', `${glare.y}%`);
      refElement.current?.style.setProperty('--r-x', `${rotate.x}deg`);
      refElement.current?.style.setProperty('--r-y', `${rotate.y}deg`);
      refElement.current?.style.setProperty('--bg-x', `${background.x}%`);
      refElement.current?.style.setProperty('--bg-y', `${background.y}%`);
    }
  };

  const updateFromEvent = (event: React.PointerEvent<HTMLDivElement>) => {
    const rotateFactor = 0.3;
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    const percentage = {
      x: (100 / rect.width) * position.x,
      y: (100 / rect.height) * position.y,
    };
    const delta = {
      x: percentage.x - 50,
      y: percentage.y - 50,
    };

    const { background, rotate, glare } = state.current;
    background.x = 50 + percentage.x / 4 - 12.5;
    background.y = 50 + percentage.y / 3 - 16.67;
    rotate.x = -(delta.x / 3.5);
    rotate.y = delta.y / 2;
    rotate.x *= rotateFactor;
    rotate.y *= rotateFactor;
    glare.x = percentage.x;
    glare.y = percentage.y;

    updateStyles();
  };

  return (
    <div
      style={containerStyle}
      className="relative isolate contain-[layout_style] perspective-[600px] transition-transform duration-(--duration) ease-(--easing) will-change-transform w-full aspect-4/5 max-w-64 h-80 touch-pan-y"
      ref={refElement}
      onPointerMove={updateFromEvent}
      onPointerDown={(event) => {
        isPointerInside.current = true;
        setIsActive(true);
        refElement.current?.style.setProperty('--duration', '0s');
        updateFromEvent(event);
      }}
      onPointerEnter={() => {
        isPointerInside.current = true;
        if (refElement.current) {
          setTimeout(() => {
            if (isPointerInside.current) {
              refElement.current?.style.setProperty('--duration', '0s');
            }
          }, 300);
        }
      }}
      onPointerLeave={() => {
        isPointerInside.current = false;
        setIsActive(false);
        if (refElement.current) {
          refElement.current.style.removeProperty('--duration');
          refElement.current?.style.setProperty('--r-x', '0deg');
          refElement.current?.style.setProperty('--r-y', '0deg');
        }
      }}
      onPointerUp={() => {
        isPointerInside.current = false;
        setIsActive(false);
        if (refElement.current) {
          refElement.current.style.removeProperty('--duration');
          refElement.current?.style.setProperty('--r-x', '0deg');
          refElement.current?.style.setProperty('--r-y', '0deg');
        }
      }}
      onPointerCancel={() => {
        isPointerInside.current = false;
        setIsActive(false);
        if (refElement.current) {
          refElement.current.style.removeProperty('--duration');
          refElement.current?.style.setProperty('--r-x', '0deg');
          refElement.current?.style.setProperty('--r-y', '0deg');
        }
      }}
    >
      <div
        data-active={isActive || active}
        className={cn(
          `h-full grid will-change-transform origin-center transition-transform duration-(--duration) ease-(--easing) transform-[rotateY(var(--r-x))_rotateX(var(--r-y))] rounded-(--radius) border [--opacity:0] hover:[--duration:150ms] hover:[--easing:linear] overflow-hidden shadow-lg hover:shadow-xl ${
            isLightTheme
              ? 'hover:[--opacity:0.5] data-[active=true]:[--opacity:0.5]'
              : 'hover:[--opacity:0.8] data-[active=true]:[--opacity:0.8]'
          }`,
          accent ? ACCENT_BORDER[accent] : 'border-ctp-surface0'
        )}
      >
        {/* Card face — the foil now lives inside the art window (see SkillItem),
            so the full face stays clean and legible. */}
        <div className="w-full h-full grid [grid-area:1/1] [clip-path:inset(0_0_0_0_round_var(--radius))]">
          <div className={cn('h-full w-full bg-ctp-mantle', className)}>{children}</div>
        </div>
        {/* Subtle pointer-tracked glare highlight, kept faint on all themes. */}
        <div
          className="w-full h-full grid [grid-area:1/1] pointer-events-none mix-blend-soft-light [clip-path:inset(0_0_1px_0_round_var(--radius))] opacity-(--opacity) transition-opacity duration-(--duration) ease-(--easing) will-change-background"
          style={{
            background: `radial-gradient(farthest-corner_circle_at_var(--m-x)_var(--m-y), rgba(${
              colors.text.rgb.r
            }, ${colors.text.rgb.g}, ${colors.text.rgb.b}, ${
              0.7 * glareMultiplier
            }) 5%, rgba(${colors.lavender.rgb.r}, ${colors.lavender.rgb.g}, ${
              colors.lavender.rgb.b
            }, ${0.35 * glareMultiplier}) 25%, transparent 70%)`,
          }}
        />
      </div>
    </div>
  );
};

export default GlareCard;
