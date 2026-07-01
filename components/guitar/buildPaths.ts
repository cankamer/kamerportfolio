/**
 * Pure SVG path builders for the interactive guitar strings.
 *
 * Coordinates are in pixels (the container is measured at runtime), so strokes
 * never distort. Everything here is side-effect free and unit-testable.
 */

export type Orientation = "horizontal" | "vertical";

/**
 * A single string as a quadratic curve. `lane` is the resting position on the
 * cross axis; `cp` is the control-point position on the cross axis (lane +
 * vibration displacement). `length` is the span along the main axis.
 *
 *   horizontal → runs left→right at y=lane, bulges in y
 *   vertical   → runs top→bottom at x=lane, bulges in x
 */
export function stringPath(
  orientation: Orientation,
  lane: number,
  length: number,
  cp: number
): string {
  if (orientation === "horizontal") {
    return `M 0 ${lane} Q ${length / 2} ${cp} ${length} ${lane}`;
  }
  return `M ${lane} 0 Q ${cp} ${length / 2} ${lane} ${length}`;
}

/**
 * The winding "vine / roadmap" the broken string morphs into.
 *
 * IMPORTANT: this is generated with the EXACT same math as the Timeline's
 * WindingLine (center axis x=50, AMPLITUDE=26, cubic control ratio 0.25, each
 * segment 100 viewBox-units tall) so the vine and "A Winding Path of Craft"
 * are visually one continuous line. The vine is rendered in a normalized
 * `0 0 100 viewHeight` viewBox with preserveAspectRatio="none", matching the
 * timeline, then stretched to its measured pixel height.
 */
/** Amplitude as a fraction of width — matches the timeline's 26 / 100. */
export const WINDING_AMPLITUDE_RATIO = 0.26;

/**
 * Built in REAL pixel coordinates (viewBox 0 0 widthPx heightPx, no aspect
 * distortion) so Framer's `pathLength` maps linearly to the visible draw — a
 * normalized/stretched viewBox skews the path length and makes the gold appear
 * to fill all at once.
 */
export function vinePath(
  widthPx: number,
  heightPx: number,
  segments: number
): string {
  const seg = Math.max(1, Math.round(segments));
  const axis = widthPx / 2;
  const amp = WINDING_AMPLITUDE_RATIO * widthPx;
  const stepY = heightPx / seg;

  let d = `M ${axis} 0`;
  for (let i = 1; i <= seg; i++) {
    const y0 = (i - 1) * stepY;
    const y1 = i * stepY;
    // Mirrored relative to the timeline: the vine's first swing goes LEFT, so it
    // reads as the reflection of "A Winding Path of Craft" flowing into it.
    const bulge = i % 2 === 1 ? axis - amp : axis + amp;
    d += ` C ${bulge} ${y0 + stepY * 0.25}, ${bulge} ${y1 - stepY * 0.25}, ${axis} ${y1}`;
  }
  return d;
}
