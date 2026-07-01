import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Glassmorphic gold/marble surface. A faint gold hairline runs across the top
 * edge to evoke gilt framing; the body is frosted obsidian-marble.
 */
export default function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gold/15 bg-marble/50 backdrop-blur-md",
        "shadow-[0_8px_40px_-12px_rgba(0,0,0,0.7)]",
        "before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px",
        "before:bg-gradient-to-r before:from-transparent before:via-gold/70 before:to-transparent",
        className
      )}
    >
      {children}
    </div>
  );
}
