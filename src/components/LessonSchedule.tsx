import {
  Handshake,
  Compass,
  BookOpen,
  PencilRuler,
  Flag,
  Clock,
  type LucideIcon,
} from "lucide-react";
import type { ScheduleStage } from "@/lib/plan-content";

const STAGE_ICONS: Record<string, LucideIcon> = {
  Acolhida: Handshake,
  Introdução: Compass,
  Desenvolvimento: BookOpen,
  "Atividade Prática": PencilRuler,
  Fechamento: Flag,
};

function formatarFaixa(inicio: number, fim: number) {
  const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  return `${fmt(inicio)} – ${fmt(fim)}`;
}

export function LessonSchedule({ schedule }: { schedule: ScheduleStage[] }) {
  let acumulado = 0;

  return (
    <ol className="relative">
      {schedule.map((etapa, i) => {
        const Icon = STAGE_ICONS[etapa.stage] ?? Clock;
        const inicio = acumulado;
        acumulado += etapa.durationMinutes;
        const ultimo = i === schedule.length - 1;

        return (
          <li key={`${etapa.stage}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-accent text-ink">
                <Icon className="h-[18px] w-[18px]" aria-hidden />
              </span>
              {!ultimo && <span className="mt-1 w-px flex-1 bg-border" aria-hidden />}
            </div>

            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h4 className="text-sm font-semibold text-ink">{etapa.stage}</h4>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {formatarFaixa(inicio, acumulado)}
                </span>
                <span className="rounded border border-border px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {etapa.durationMinutes} min
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">{etapa.description}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-ink">O que você faz: </span>
                {etapa.teacherAction}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
