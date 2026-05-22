import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type IInputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className, ...props }: IInputProps) => (
  <input
    className={cn(
      "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-[3px] focus:ring-indigo-100",
      className
    )}
    {...props}
  />
);
