'use client';

import { ArrowsRightLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import type { RarityTier } from '@/lib/rarity';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { type Skill, SkillCardBack, SkillCardFront } from './SkillCardFaces';

export type Face = 'front' | 'back';

/** The card's natural width (the grid's widest track), in rem; the viewer
 *  zooms it up from there, so it lays out exactly like the grid card. */
const CARD_REM = 17;
/** Room the viewer's chrome (close button band, side switch, hint) takes
 *  from the viewport height, in rem. */
const CHROME_REM = 13;
/** Room left and right of the card: the dialog's padding plus a margin. */
const SIDE_REM = 3;
/** Largest zoom: past this the card stops reading as a card in the hand. */
const MAX_ZOOM = 1.5;

/** Degrees of spin per pixel dragged, and of tilt per pixel dragged up/down. */
const SPIN_PER_PX = 0.55;
const TILT_PER_PX = 0.3;
const MAX_TILT = 22;
/** A press that travels less than this is a tap: it turns the card over. */
const TAP_SLOP = 6;
/** How far a flick carries: seconds of release velocity added to the angle
 *  before it snaps to the nearest face. */
const FLICK = 0.22;
/** At most this many half-turns from one flick. */
const MAX_HALF_TURNS = 4;

/** Spring constants (per second²/per second). Slightly under-damped, so a
 *  card that lands overshoots a hair and settles, like something with
 *  weight. */
const SPIN = { stiffness: 120, damping: 16 };
const TILT = { stiffness: 150, damping: 20 };

/** The edge: layers stacked between the two faces, which sit this far either
 *  side of the card's middle (px). Seen side-on they read as its thickness. */
const HALF_DEPTH = 2;
const EDGE_LAYERS = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5];

const faceAt = (angle: number): Face =>
  ((Math.round(angle / 180) % 2) + 2) % 2 === 0 ? 'front' : 'back';
const nearestFace = (angle: number) => Math.round(angle / 180) * 180;

type Motion = {
  angle: number;
  velocity: number;
  target: number;
  tilt: number;
  tiltVelocity: number;
  /** 0–1: how much of the idle sway is mixed in. */
  sway: number;
  restingFor: number;
  drag: null | { x: number; y: number; at: number; travel: number };
  /** What was last shown, sway included. */
  shown: { y: number; x: number };
};

/** Turn half a revolution, one way or the other, from wherever the card is
 *  headed. */
function turnOver(m: Motion, direction: 1 | -1) {
  m.target = nearestFace(m.target) + 180 * direction;
}

/**
 * The card in the hand: the same two-sided card as the grid, brought close
 * and free to turn. Drag spins it in 3D (a flick keeps it spinning) and it
 * settles on whichever face is nearer; a tap or click turns it over, and so
 * do the arrow keys and the side switch under it. Left alone, it sways a
 * little so the foil keeps catching the light.
 *
 * Rendered inside SkillItem's `<dialog>`; `onFaceChange` reports the face
 * the card settles on, so the grid card can show the same one when the
 * viewer closes.
 */
export function SkillViewer({
  skill,
  tier,
  style,
  initialFace,
  onFaceChange,
  onClose,
  dragGuard,
}: {
  skill: Skill;
  tier?: RarityTier;
  style: React.CSSProperties;
  initialFace: Face;
  onFaceChange: (face: Face) => void;
  onClose: () => void;
  /** Set while a drag ends, so the dialog doesn't take the release for a
   *  click on the backdrop. */
  dragGuard: React.RefObject<boolean>;
}) {
  const t = useTranslations('skills');
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const start = initialFace === 'back' ? 180 : 0;
  const motion = useRef<Motion>({
    angle: start,
    velocity: 0,
    target: start,
    tilt: 0,
    tiltVelocity: 0,
    sway: 0,
    restingFor: 0,
    drag: null,
    shown: { y: start, x: 0 },
  });
  const [face, setFace] = useState<Face>(initialFace);
  // Announce turns, but not the side the viewer opens on.
  const [announced, setAnnounced] = useState(false);
  const faceRef = useRef(face);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const report = useEffectEvent((next: Face) => {
    if (next === faceRef.current) return;
    faceRef.current = next;
    setFace(next);
    setAnnounced(true);
    onFaceChange(next);
  });

  // Zoom the card to fit the viewport, before the dialog shows (and before
  // the open morph captures it).
  useLayoutEffect(() => {
    const fit = () => {
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const width = CARD_REM * rem;
      const zoom = Math.min(
        MAX_ZOOM,
        (window.innerWidth - SIDE_REM * rem) / width,
        (window.innerHeight - CHROME_REM * rem) / ((width * 7) / 5)
      );
      rootRef.current?.style.setProperty('--viewer-zoom', String(Math.max(0.45, zoom)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // One loop drives the card: springs toward the target face, the idle
  // sway, and the custom properties the card and its foils read. Writes only
  // what changed, so a card at rest under reduced motion costs nothing.
  useLayoutEffect(() => {
    const card = cardRef.current;
    const stage = stageRef.current;
    if (!card || !stage) return;
    let frame = 0;
    let last = performance.now();
    let written = '';

    const step = (now: number) => {
      const m = motion.current;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const still = reducedRef.current;

      if (!m.drag) {
        if (still) {
          m.angle = m.target;
          m.velocity = 0;
          m.tilt = 0;
          m.tiltVelocity = 0;
        } else {
          m.velocity += (SPIN.stiffness * (m.target - m.angle) - SPIN.damping * m.velocity) * dt;
          m.angle += m.velocity * dt;
          m.tiltVelocity += (TILT.stiffness * -m.tilt - TILT.damping * m.tiltVelocity) * dt;
          m.tilt += m.tiltVelocity * dt;
          if (Math.abs(m.target - m.angle) < 0.2 && Math.abs(m.velocity) < 1) {
            m.angle = m.target;
            m.velocity = 0;
          }
        }
      }

      // Sway eases in once the card has rested a moment, and out at once
      // when a hand takes it.
      const settled = !m.drag && m.angle === m.target && Math.abs(m.tilt) < 0.5;
      m.restingFor = settled ? m.restingFor + dt : 0;
      const goal = !still && m.restingFor > 1.2 ? 1 : 0;
      m.sway += (goal - m.sway) * Math.min(1, dt * (goal ? 0.8 : 8));
      const seconds = now / 1000;
      const y = m.angle + m.sway * 7 * Math.sin(seconds * 0.8);
      const x = m.tilt + m.sway * 4 * Math.sin(seconds * 0.6 + 1.3);
      m.shown = { y, x };

      // A light fixed in front of the card: its hotspot slides across the
      // face as the card turns and tips.
      const yRad = (y * Math.PI) / 180;
      const xRad = (x * Math.PI) / 180;
      const rotateY = `${y.toFixed(2)}deg`;
      const rotateX = `${x.toFixed(2)}deg`;
      const pointerX = `${(50 - Math.sin(yRad) * 45).toFixed(1)}%`;
      const pointerY = `${(50 + Math.sin(xRad) * 45).toFixed(1)}%`;
      const facing = Math.abs(Math.cos(yRad)).toFixed(3);
      const key = `${rotateY} ${rotateX} ${pointerX} ${pointerY} ${facing}`;
      if (key !== written) {
        written = key;
        card.style.setProperty('--rotate-y', rotateY);
        card.style.setProperty('--rotate-x', rotateX);
        card.style.setProperty('--pointer-x', pointerX);
        card.style.setProperty('--pointer-y', pointerY);
        stage.style.setProperty('--facing', facing);
      }

      report(faceAt(m.drag ? m.angle : m.target));
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  const turn = (direction: 1 | -1) => turnOver(motion.current, direction);

  const show = (side: Face) => {
    if (faceAt(motion.current.target) !== side) turn(1);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') turnOver(motion.current, 1);
      else if (event.key === 'ArrowLeft') turnOver(motion.current, -1);
      else return;
      event.preventDefault();
    };
    // On the dialog, so the keys work wherever focus sits inside it.
    const target: HTMLElement | null = rootRef.current?.closest('dialog') ?? rootRef.current;
    target?.addEventListener('keydown', onKey);
    return () => target?.removeEventListener('keydown', onKey);
  }, []);

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const m = motion.current;
    // Take the card where it is, sway and all, so it doesn't jump.
    m.angle = m.shown.y;
    m.tilt = m.shown.x;
    m.sway = 0;
    m.velocity = 0;
    m.tiltVelocity = 0;
    m.drag = { x: event.clientX, y: event.clientY, at: event.timeStamp, travel: 0 };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const m = motion.current;
    const drag = m.drag;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    const dt = Math.max(1, event.timeStamp - drag.at) / 1000;
    const spin = dx * SPIN_PER_PX;
    m.angle += spin;
    m.tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, m.tilt - dy * TILT_PER_PX));
    // Smoothed, so one jittery sample doesn't decide the flick.
    m.velocity = 0.7 * (spin / dt) + 0.3 * m.velocity;
    m.drag = {
      x: event.clientX,
      y: event.clientY,
      at: event.timeStamp,
      travel: drag.travel + Math.hypot(dx, dy),
    };
  };

  const onPointerUp = (event: React.PointerEvent) => {
    const m = motion.current;
    const drag = m.drag;
    if (!drag) return;
    m.drag = null;

    if (drag.travel < TAP_SLOP) {
      // A tap turns the card toward the side it was tapped on.
      const box = event.currentTarget.getBoundingClientRect();
      m.velocity = 0;
      turn(event.clientX >= box.left + box.width / 2 ? 1 : -1);
      return;
    }

    dragGuard.current = true;
    window.setTimeout(() => {
      dragGuard.current = false;
    }, 0);
    // A hand that stopped before letting go doesn't flick.
    if (event.timeStamp - drag.at > 80) m.velocity = 0;
    const reach = MAX_HALF_TURNS * 180;
    const thrown = Math.max(-reach, Math.min(reach, m.velocity * FLICK));
    m.target = nearestFace(m.angle + thrown);
  };

  const onPointerCancel = () => {
    const m = motion.current;
    if (!m.drag) return;
    m.drag = null;
    m.target = nearestFace(m.angle);
  };

  return (
    <div ref={rootRef} className="skill-viewer" style={style}>
      <button type="button" onClick={onClose} className="skill-viewer__close">
        <XMarkIcon aria-hidden className="size-5" />
        <span className="sr-only">{t('close')}</span>
      </button>

      {/* Dragging is a pointer enhancement: the keyboard turns the card with
          the arrow keys and the side switch. */}
      <div
        ref={stageRef}
        className="skill-viewer__stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {/* The morph's name goes on a wrapper: like opacity, it renders its
            element flat, which on the card itself would print the front
            mirrored where the back should be. */}
        <div className="skill-viewer__card" style={{ viewTransitionName: 'skill-card' }}>
          <div
            ref={cardRef}
            data-active
            data-rarity={tier}
            className="skill-card"
            // The side it opens on, before the loop's first frame: the open
            // morph may capture the card before then.
            style={{ ...style, '--rotate-y': `${start}deg` } as React.CSSProperties}
          >
            <div className="skill-card__flipper">
              {EDGE_LAYERS.map((z) => (
                <div
                  key={z}
                  aria-hidden
                  className="skill-card__edge"
                  style={{ transform: `translateZ(${z}px)` }}
                />
              ))}
              <div
                className="skill-card__side"
                inert={face !== 'front'}
                style={{ transform: `translateZ(${HALF_DEPTH}px)` }}
              >
                <SkillCardFront skill={skill} tier={tier} />
                <div aria-hidden className="skill-card__glare" />
              </div>
              <div
                className="skill-card__side skill-card__side--back"
                inert={face !== 'back'}
                style={{ transform: `rotateY(180deg) translateZ(${HALF_DEPTH}px)` }}
              >
                <SkillCardBack skill={skill} />
                <div aria-hidden className="skill-card__glare" />
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden className="skill-viewer__shadow" />
      </div>

      <div className="skill-viewer__controls">
        <fieldset className="skill-viewer__switch">
          <legend className="sr-only">{t('viewer.side')}</legend>
          {(['front', 'back'] as const).map((side) => (
            <button
              key={side}
              type="button"
              aria-pressed={face === side}
              onClick={() => show(side)}
            >
              {t(`viewer.${side}`)}
            </button>
          ))}
        </fieldset>
        <p className="skill-viewer__hint">
          <ArrowsRightLeftIcon aria-hidden className="size-3.5 shrink-0" />
          <span className="[@media(hover:none)]:hidden">{t('viewer.hintPointer')}</span>
          <span className="hidden [@media(hover:none)]:inline">{t('viewer.hintTouch')}</span>
        </p>
      </div>

      <p aria-live="polite" className="sr-only">
        {announced ? t('viewer.showing', { side: face }) : ''}
      </p>
    </div>
  );
}
