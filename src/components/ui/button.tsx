import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { Spinner } from "./spinner";

type IButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
  loading?: boolean;
};

const variantClasses = {
  primary:
    "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-500/30",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300",
  ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
  danger: "text-rose-600 hover:bg-rose-50 hover:text-rose-700",
};

const sizeClasses = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  icon: "h-10 w-10 text-sm",
};

export const Button = ({
  className,
  children,
  variant = "secondary",
  size = "md",
  loading = false,
  disabled,
  ...props
}: IButtonProps) => (
  <button
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
      variantClasses[variant],
      sizeClasses[size],
      className
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading && <Spinner size="sm" />}
    {children}
  </button>
);
