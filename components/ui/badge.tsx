import { cn } from "@/lib/utils";

export function Badge({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]",
        className
      )}
    >
      {children}
    </span>
  );
}
