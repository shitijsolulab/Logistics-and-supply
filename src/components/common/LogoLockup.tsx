import { cn } from "../../lib/utils";

// Logistics AI OS logo lockup: the logo.png mark (same image used for the
// favicon) + wordmark text beside it. The text is theme-aware (accent +
// foreground + muted tagline) so it reads well in both light and dark mode.
export function LogoLockup({ className }: Readonly<{ className?: string }>) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src="/logo.jpg"
        alt="Logistics & Supply Chain AI OS"
        className="h-12 w-14 shrink-0 origin-center scale-110 object-contain dark:hidden"
      />
      <img
        src="/logo-light.png"
        alt="Logistics & Supply Chain AI OS"
        className="hidden h-12 w-14 shrink-0 origin-center scale-110 object-contain dark:block"
      />
      <span className="flex flex-col leading-none">
        <span className="text-[0.52rem] font-semibold uppercase leading-[1.35] tracking-[0.16em] text-primary">
          Logistics &amp; Supply Chain
        </span>
        <span className="mt-0.5 text-lg font-bold leading-none tracking-tight text-foreground">
          AI OS
        </span>
        <span className="mt-1 text-[0.58rem] font-medium leading-none text-muted-foreground">
          The OS for logistics.
        </span>
      </span>
    </span>
  );
}
