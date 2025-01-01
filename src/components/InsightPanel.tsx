import { Skeleton } from "@/components/ui/skeleton";
import { Brain } from "lucide-react";

interface Props {
  insight: string | undefined;
  isLoading: boolean;
}

export default function InsightPanel({ insight, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
        <Brain className="h-8 w-8 mb-2 opacity-40" />
        Select an instrument to view AI insights
      </div>
    );
  }

  // Simple markdown-like rendering
  const lines = insight.split("\n").filter(Boolean);

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, i) => {
        // Bold sections
        const rendered = line.replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="text-foreground">$1</strong>'
        );
        // Italic
        const final = rendered.replace(
          /\*(.*?)\*/g,
          '<em class="text-muted-foreground">$1</em>'
        );

        return (
          <p
            key={i}
            className="text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: final }}
          />
        );
      })}
    </div>
  );
}
