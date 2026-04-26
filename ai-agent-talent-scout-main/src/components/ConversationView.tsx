import { Bot, User } from "lucide-react";
import { ChatTurn } from "@/types/agent";
import { cn } from "@/lib/utils";

interface Props {
  conversation: ChatTurn[];
  candidateName: string;
}

export function ConversationView({ conversation, candidateName }: Props) {
  return (
    <div className="space-y-3">
      {conversation.map((turn, i) => {
        const isAgent = turn.role === "agent";
        return (
          <div key={i} className={cn("flex gap-3 animate-fade-up", isAgent ? "" : "flex-row-reverse")} style={{ animationDelay: `${i * 80}ms` }}>
            <div className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
              isAgent ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
            )}>
              {isAgent ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            </div>
            <div className={cn(
              "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
              isAgent ? "bg-secondary text-secondary-foreground rounded-tl-sm" : "bg-accent/10 border border-accent/30 text-foreground rounded-tr-sm"
            )}>
              <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1 font-mono-tight">
                {isAgent ? "Agent" : candidateName}
              </div>
              <div className="whitespace-pre-wrap">{turn.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
