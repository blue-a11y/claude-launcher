import type { OptionHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ISelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = ({ className, children, ...props }: ISelectProps) => (
  <select
    className={cn(
      "h-10 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-[3px] focus:ring-indigo-100",
      className
    )}
    {...props}
  >
    {children}
  </select>
);

export const SelectOption = ({ className, ...props }: OptionHTMLAttributes<HTMLOptionElement>) => (
  <option className={cn("bg-white text-slate-900", className)} {...props} />
);
