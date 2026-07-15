import { cn } from "../../lib/utils";

// Logistics AI OS logo lockup: the logo.png mark (same image used for the
// favicon) + wordmark text beside it. The text is theme-aware (accent +
// foreground + muted tagline) so it reads well in both light and dark mode.
export function LogoLockup({ className }: Readonly<{ className?: string }>) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <img
        src="/logo.png"
        alt="Logistics & Supply Chain AI OS"
        className="h-16 w-auto shrink-0 scale-110 object-contain dark:hidden"
      />
      <img
        src="/logo-light.png"
        alt="Logistics & Supply Chain AI OS"
        className="hidden h-16 w-auto shrink-0 scale-110 object-contain dark:block"
      />
      <span className="flex flex-col leading-none">
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-primary">
          Logistics &amp; Supply Chain
        </span>
        <span className="text-xl font-bold tracking-tight text-foreground">AI OS</span>
        <span className="mt-1 text-[0.6rem] font-medium text-muted-foreground">
          The OS for logistics.
        </span>
      </span>
    </span>
  );
}
