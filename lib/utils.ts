/**
 * Tiny className joiner — keeps JSX readable without pulling in a dependency.
 * Filters out falsy values so `cn("a", cond && "b")` works.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
