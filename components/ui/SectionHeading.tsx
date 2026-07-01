import { cn } from "@/lib/utils";

/**
 * Shared eyebrow + serif title block used by each major section.
 */
export default function SectionHeading({
  eyebrow,
  title,
  className,
}: {
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <header className={cn("text-center", className)}>
      <p className="font-sans text-xs uppercase tracking-[0.4em] text-gold-dim">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-4xl text-ivory sm:text-5xl">{title}</h2>
    </header>
  );
}
