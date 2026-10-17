'use client';

import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import TiltCard from '@/components/TiltCard';
import { type Skill, SkillCardBack, SkillCardFront, useCardLook } from './SkillCardFaces';
import { type Face, SkillViewer } from './SkillViewer';

/** Shared by the grid card and the viewer's card, so the browser morphs one
 *  into the other. Only one card ever carries it at a time. */
const TRANSITION_NAME = 'skill-card';

/**
 * A skill as a two-sided trading card. Proficiency sets the card's rarity,
 * and the rarity decides which foil it gets — see `src/styles/skill-card.css`,
 * which holds every visual of the card that isn't plain layout.
 *
 * - Front: the collectible face — name, art, tags, rarity, and the flavor
 *   text ({@link SkillCardFront}).
 * - Back: the "rules" side — what the skill is, at reading size, over its
 *   stats ({@link SkillCardBack}). Clicking or tapping the card turns it over
 *   (and back again).
 * - The back's inspect button picks the card up: it morphs into the viewer
 *   ({@link SkillViewer}), where it can be spun in 3D. It comes back down
 *   showing whichever side it was left on.
 */
const SkillItem: React.FC<{ skill: Skill }> = ({ skill }) => {
  const t = useTranslations('skills');
  const { tier, style } = useCardLook(skill);
  const name = skill.name ?? '';

  const cardRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const inspectButton = useRef<HTMLButtonElement>(null);
  const viewerFace = useRef<Face>('front');
  const dragGuard = useRef(false);
  const [flipped, setFlipped] = useState(false);
  const [open, setOpen] = useState(false);

  // The side turned away is inert, so focus would drop to <body>; hand it to
  // the button that turns the card back instead.
  const turn = (toBack: boolean) => {
    flushSync(() => setFlipped(toBack));
    (toBack ? backButton : frontButton).current?.focus({ preventScroll: true });
  };

  const openViewer = () => {
    viewerFace.current = flipped ? 'back' : 'front';
    morph(cardRef.current, 'open', () => {
      flushSync(() => setOpen(true));
      dialogRef.current?.showModal();
    });
  };

  // The card comes back down the way it was left in the viewer. Focus goes
  // back to the button that turns the side now showing (the dialog would
  // restore it to the inspect button, which may now be turned away).
  const closeViewer = () => {
    const toBack = viewerFace.current === 'back';
    morph(cardRef.current, 'close', () => {
      dialogRef.current?.close();
      flushSync(() => {
        setOpen(false);
        setFlipped(toBack);
      });
      (toBack ? inspectButton : frontButton).current?.focus({ preventScroll: true });
    });
  };

  return (
    <>
      <TiltCard
        ref={cardRef}
        data-card
        data-rarity={tier}
        data-flipped={flipped || undefined}
        className="skill-card"
        style={style}
      >
        <div className="skill-card__flipper">
          <div className="skill-card__side" inert={flipped}>
            <SkillCardFront skill={skill} tier={tier} />
            {/* The whole side is the button: a transparent layer over the
                face, under the glare. Keeps the face's own semantics
                (heading, list). */}
            <button
              ref={frontButton}
              type="button"
              onClick={() => turn(true)}
              className="skill-card__open"
            >
              <span className="sr-only">{t('flip', { name })}</span>
            </button>
            <div aria-hidden className="skill-card__glare" />
          </div>

          {/* Esc from anywhere on the back (either button) turns it over. */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: catches Esc bubbling up from the back's own buttons */}
          <div
            className="skill-card__side skill-card__side--back"
            inert={!flipped}
            onKeyDown={(event) => {
              if (event.key === 'Escape') turn(false);
            }}
          >
            <SkillCardBack skill={skill} />
            <button
              ref={backButton}
              type="button"
              onClick={() => turn(false)}
              className="skill-card__open"
            >
              <span className="sr-only">{t('flipBack', { name })}</span>
            </button>
            <button
              ref={inspectButton}
              type="button"
              aria-haspopup="dialog"
              onClick={openViewer}
              title={t('inspect', { name })}
              className="skill-card__inspect"
            >
              <ArrowsPointingOutIcon aria-hidden className="size-4" />
              <span className="sr-only">{t('inspect', { name })}</span>
            </button>
            <div aria-hidden className="skill-card__glare" />
          </div>
        </div>
      </TiltCard>

      {open && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: the click handles the backdrop; Esc (onCancel) is the keyboard path
        <dialog
          ref={dialogRef}
          aria-label={name}
          className="skill-dialog"
          onCancel={(event) => {
            // Esc: close through the same animated path as the button.
            event.preventDefault();
            closeViewer();
          }}
          onClick={(event) => {
            // The dialog fills the viewport; a click on it (not on its
            // content) is a click on the backdrop — unless it's the end of
            // a drag that wandered off the card.
            if (event.target === event.currentTarget && !dragGuard.current) closeViewer();
          }}
        >
          <SkillViewer
            skill={skill}
            tier={tier}
            style={style}
            initialFace={viewerFace.current}
            onFaceChange={(face) => {
              viewerFace.current = face;
            }}
            onClose={closeViewer}
            dragGuard={dragGuard}
          />
        </dialog>
      )}
    </>
  );
};

/**
 * Runs a DOM update inside a view transition, so the grid card and the
 * dialog card morph into each other. The source card carries the shared
 * transition name on whichever side of the change it's visible.
 *
 * Falls back to an instant update without the API or with reduced motion.
 */
function morph(source: HTMLElement | null, direction: 'open' | 'close', update: () => void) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!source || reduced || !document.startViewTransition) {
    update();
    return;
  }

  if (direction === 'open') {
    source.style.viewTransitionName = TRANSITION_NAME;
    document.startViewTransition(() => {
      source.style.viewTransitionName = '';
      update();
    });
  } else {
    const transition = document.startViewTransition(() => {
      update();
      source.style.viewTransitionName = TRANSITION_NAME;
    });
    transition.finished.finally(() => {
      source.style.viewTransitionName = '';
    });
  }
}

export default SkillItem;
