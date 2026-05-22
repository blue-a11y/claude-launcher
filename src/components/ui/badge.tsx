import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type IBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "muted";
};

const variantClasses = {
  default: "border-indigo-200/80 bg-indigo-50/80 text-indigo-700",
  success: "border-emerald-200/80 bg-emerald-50/80 text-emerald-700",
  muted: "border-slate-200/80 bg-slate-100/80 text-slate-600",
};

export const Badge = ({ className, variant = "default", ...props }: IBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
      variantClasses[variant],
      className
    )}
    {...props}
  />
);
