/**
 * Standard guitar tuning (6th → 1st string), thickest/lowest at the top.
 * The 1st string (high "e", index 5) is the thinnest — it's the one that
 * snaps on scroll and becomes the roadmap vine.
 */

export interface GuitarStringDef {
  id: string;
  /** Scientific pitch, e.g. "E2". */
  note: string;
  /** Short label shown by the string head: E A D G B e. */
  label: string;
  /** Real tuning frequency in Hz. */
  frequency: number;
  /** Relative visual stroke thickness. */
  thickness: number;
}

export const GUITAR_STRINGS: GuitarStringDef[] = [
  { id: "low-e", note: "E2", label: "E", frequency: 82.41, thickness: 3.2 },
  { id: "a", note: "A2", label: "A", frequency: 110.0, thickness: 2.8 },
  { id: "d", note: "D3", label: "D", frequency: 146.83, thickness: 2.4 },
  { id: "g", note: "G3", label: "G", frequency: 196.0, thickness: 2.0 },
  { id: "b", note: "B3", label: "B", frequency: 246.94, thickness: 1.5 },
  { id: "high-e", note: "E4", label: "e", frequency: 329.63, thickness: 1.0 },
];

/** Index of the string that breaks (thinnest, high e). */
export const BREAKING_STRING_INDEX = GUITAR_STRINGS.length - 1;
