import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AgentStep = {
  id: string;
  label: string;
  status: "pending" | "running" | "done";
  detail?: string;
};

interface Props {
  steps: AgentStep[];
}

export function AgentTimeline({ steps }: Props) {
  return (
    <ol className="relative space-y-3 border-l border-border pl-5">
      {steps.map((s) => (
        <li key={s.id} className="relative animate-fade-up">
          <span className={cn(
            "absolute -left-[27px] flex h-4 w-4 items-center justify-center rounded-full border",
            s.status === "done" && "bg-primary border-primary text-primary-foreground",
            s.status === "running" && "bg-accent/20 border-accent",
            s.status === "pending" && "bg-card border-border",
          )}>
            {s.status === "done" && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
            {s.status === "running" && <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />}
          </span>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-sm font-medium",
              s.status === "pending" && "text-muted-foreground",
            )}>{s.label}</span>
            {s.status === "running" && <Loader2 className="h-3 w-3 animate-spin text-accent" />}
          </div>
          {s.detail && <p className="text-xs text-muted-foreground mt-0.5 font-mono-tight">{s.detail}</p>}
        </li>
      ))}
    </ol>
  );
}
