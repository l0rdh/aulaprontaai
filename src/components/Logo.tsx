import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-ink-foreground">
        <GraduationCap className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-ink">
        AulaPronta IA
      </span>
    </span>
  );
}
