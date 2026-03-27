import * as AvatarPrimitive from "@radix-ui/react-avatar";

export function Avatar({ children }: { children: React.ReactNode }) {
  return <AvatarPrimitive.Root className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">{children}</AvatarPrimitive.Root>;
}

export function AvatarImage(props: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image className="aspect-square h-full w-full object-cover" {...props} />;
}

export function AvatarFallback(props: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>) {
  return <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center bg-[var(--secondary)] text-sm font-semibold text-[var(--secondary-foreground)]" {...props} />;
}
