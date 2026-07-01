import { motionValue } from "framer-motion";

/** Becomes true when the guitar string snaps. */
export const stringBroken = motionValue(false);

/**
 * 0→1 progress driven by page scroll, spanning vine-top → timeline-bottom.
 * Comet stays at viewport center: progress=0 when vine-top is at center,
 * progress=1 when timeline-bottom is at center.
 */
export const sharedPathProgress = motionValue(0);

/** Fraction [0,1] where the vine ends and timeline begins. 0 = not broken yet. */
export const sharedVineRatio = motionValue(0);
