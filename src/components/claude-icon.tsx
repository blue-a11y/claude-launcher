import { cn } from "../lib/utils";

type IClaudeIconProps = {
  className?: string;
};

export const ClaudeIcon = ({ className }: IClaudeIconProps) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("", className)}
  >
    <path
      d="M100,20 C145,20 180,55 180,100 C180,145 145,180 100,180 C60,180 25,150 25,110 C25,75 55,45 90,45 C120,45 145,70 145,100 C145,125 125,145 100,145 C80,145 65,130 65,110 C65,95 75,85 90,85 C100,85 110,92 110,105 C110,115 102,122 92,122"
      stroke="currentColor"
      strokeWidth="28"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);
