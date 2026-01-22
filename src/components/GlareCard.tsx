import { type CatppuccinColors, flavors } from '@catppuccin/palette';
import type { Properties } from 'csstype';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useCtpStore } from '@/store';

export const GlareCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const flavor = useCtpStore((state) => state.flavor);
  const [colors, setColors] = useState<CatppuccinColors>(flavors[flavor].colors);
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
  const opacityMultiplier = isLightTheme ? 1.5 : 1;

  const containerStyle = {
    '--m-x': '50%',
    '--m-y': '50%',
    '--r-x': '0deg',
    '--r-y': '0deg',
    '--bg-x': '50%',
    '--bg-y': '50%',
    '--duration': '300ms',
    '--foil-size': '100%',
    '--opacity': '0',
    '--radius': '16px',
    '--easing': 'ease',
    '--transition': 'var(--duration) var(--easing)',
  } as React.CSSProperties;

  const backgroundStyle = {
    '--step': '4%',
    '--subtle-pattern': `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='${colors.lavender.hex.replace(
      '#',
      '%23'
    )}' fill-opacity='${isLightTheme ? '0.3' : '0.1'}'/%3E%3C/svg%3E")`,
    '--pattern': 'var(--subtle-pattern) center/80px 80px repeat',
    '--catppuccin-rainbow': `repeating-linear-gradient( 45deg, rgba(${colors.teal.rgb.r}, ${
      colors.teal.rgb.g
    }, ${colors.teal.rgb.b}, ${0.8 * opacityMultiplier}) calc(var(--step) * 1), rgba(${
      colors.sky.rgb.r
    }, ${colors.sky.rgb.g}, ${colors.sky.rgb.b}, ${
      0.7 * opacityMultiplier
    }) calc(var(--step) * 2), rgba(${colors.sapphire.rgb.r}, ${colors.sapphire.rgb.g}, ${
      colors.sapphire.rgb.b
    }, ${0.8 * opacityMultiplier}) calc(var(--step) * 3), rgba(${colors.blue.rgb.r}, ${
      colors.blue.rgb.g
    }, ${colors.blue.rgb.b}, ${0.7 * opacityMultiplier}) calc(var(--step) * 4), rgba(${
      colors.lavender.rgb.r
    }, ${colors.lavender.rgb.g}, ${colors.lavender.rgb.b}, ${
      0.9 * opacityMultiplier
    }) calc(var(--step) * 5), rgba(${colors.pink.rgb.r}, ${colors.pink.rgb.g}, ${
      colors.pink.rgb.b
    }, ${0.8 * opacityMultiplier}) calc(var(--step) * 6), rgba(${colors.mauve.rgb.r}, ${
      colors.mauve.rgb.g
    }, ${colors.mauve.rgb.b}, ${
      0.7 * opacityMultiplier
    }) calc(var(--step) * 7) ) 0% var(--bg-y)/200% 600% no-repeat`,
    '--diagonal': `repeating-linear-gradient( 135deg, rgba(${colors.surface0.rgb.r}, ${
      colors.surface0.rgb.g
    }, ${colors.surface0.rgb.b}, ${0.4 * opacityMultiplier}) 0%, rgba(${colors.surface1.rgb.r}, ${
      colors.surface1.rgb.g
    }, ${colors.surface1.rgb.b}, ${0.6 * opacityMultiplier}) 2px, rgba(${colors.surface0.rgb.r}, ${
      colors.surface0.rgb.g
    }, ${colors.surface0.rgb.b}, ${0.4 * opacityMultiplier}) 4px, rgba(${colors.mantle.rgb.r}, ${
      colors.mantle.rgb.g
    }, ${colors.mantle.rgb.b}, ${
      0.3 * opacityMultiplier
    }) 8px ) var(--bg-x) var(--bg-y)/150% 150% no-repeat`,
    '--shine': `linear-gradient( 45deg, transparent 30%, rgba(${colors.lavender.rgb.r}, ${
      colors.lavender.rgb.g
    }, ${colors.lavender.rgb.b}, ${
      0.15 * opacityMultiplier
    }) 50%, transparent 70% ) var(--bg-x) var(--bg-y)/200% 200% no-repeat`,
    backgroundBlendMode: isLightTheme
      ? 'multiply, overlay, soft-light'
      : 'soft-light, hue, multiply, overlay',
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

  return (
    <div
      style={containerStyle}
      className="relative isolate contain-[layout_style] perspective-[600px] transition-transform duration-(--duration) ease-(--easing) will-change-transform w-full aspect-4/5 max-w-50 h-70"
      ref={refElement}
      onPointerMove={(event) => {
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
        if (refElement.current) {
          refElement.current.style.removeProperty('--duration');
          refElement.current?.style.setProperty('--r-x', '0deg');
          refElement.current?.style.setProperty('--r-y', '0deg');
        }
      }}
    >
      <div
        className={`h-full grid will-change-transform origin-center transition-transform duration-(--duration) ease-(--easing) transform-[rotateY(var(--r-x))_rotateX(var(--r-y))] rounded-(--radius) border border-ctp-surface0 hover:[--duration:150ms] hover:[--easing:linear] overflow-hidden shadow-lg ${
          isLightTheme ? 'hover:[--opacity:1.2]' : 'hover:[--opacity:0.9]'
        }`}
      >
        <div className="w-full h-full grid [grid-area:1/1] mix-blend-soft-light [clip-path:inset(0_0_0_0_round_var(--radius))]">
          <div className={cn('h-full w-full bg-ctp-mantle', className)}>{children}</div>
        </div>
        <div
          className="w-full h-full grid [grid-area:1/1] mix-blend-soft-light [clip-path:inset(0_0_1px_0_round_var(--radius))] opacity-(--opacity) transition-opacity duration-(--duration) ease-(--easing) will-change-background"
          style={{
            background: `radial-gradient(farthest-corner_circle_at_var(--m-x)_var(--m-y), rgba(${
              colors.lavender.rgb.r
            }, ${colors.lavender.rgb.g}, ${colors.lavender.rgb.b}, ${
              0.9 * opacityMultiplier
            }) 5%, rgba(${colors.teal.rgb.r}, ${colors.teal.rgb.g}, ${colors.teal.rgb.b}, ${
              0.7 * opacityMultiplier
            }) 15%, rgba(${colors.pink.rgb.r}, ${colors.pink.rgb.g}, ${colors.pink.rgb.b}, ${
              0.5 * opacityMultiplier
            }) 30%, rgba(${colors.sky.rgb.r}, ${colors.sky.rgb.g}, ${colors.sky.rgb.b}, ${
              0.3 * opacityMultiplier
            }) 50%, transparent 90%)`,
          }}
        />
        <div
          className="w-full h-full grid [grid-area:1/1] mix-blend-color-dodge opacity-(--opacity) will-change-background transition-opacity [clip-path:inset(0_0_1px_0_round_var(--radius))] relative after:content-[''] after:absolute after:inset-0 after:bg-linear-to-br after:from-transparent after:via-white/5 after:to-transparent after:mix-blend-overlay"
          style={{
            background: 'var(--catppuccin-rainbow), var(--diagonal), var(--shine)',
            backgroundSize: '200% 600%, 150% 150%, 200% 200%',
            backgroundPosition: '0% var(--bg-y), var(--bg-x) var(--bg-y), var(--bg-x) var(--bg-y)',
            ...backgroundStyle,
          }}
        />
      </div>
    </div>
  );
};

export default GlareCard;
