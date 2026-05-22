import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ICardProps = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: ICardProps) => (
  <div
    className={cn(
      "rounded-2xl border border-slate-200/80 bg-white/90 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all duration-200",
      className
    )}
    {...props}
  />
);
