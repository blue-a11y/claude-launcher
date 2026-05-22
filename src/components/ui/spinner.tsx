import { cn } from "../../lib/utils";

type ISpinnerProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "h-3.5 w-3.5 border-[1.5px]",
  md: "h-4 w-4 border-2",
  lg: "h-5 w-5 border-2",
};

export const Spinner = ({ className, size = "md" }: ISpinnerProps) => (
  <div
    className={cn(
      "inline-block animate-spin rounded-full border-current border-t-transparent",
      sizeMap[size],
      className
    )}
  />
);
