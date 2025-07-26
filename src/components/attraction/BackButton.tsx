import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface BackButtonProps {
  onClick: () => void;
  className?: string;
  variant?: "header" | "floating";
}

export function BackButton({
  onClick,
  className,
  variant = "header",
}: BackButtonProps) {
  if (variant === "floating") {
    return (
      <Button
        onClick={onClick}
        size="icon"
        className={cn(
          "fixed top-4 left-4 z-50 h-12 w-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border hover:bg-background/90",
          className
        )}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={cn(
        "gap-2 text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      กลับหน้าหลัก
    </Button>
  );
}
