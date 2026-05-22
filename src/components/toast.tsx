import { useState, useRef, useCallback } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "../lib/utils";

type IToastProps = {
  message: string;
  type: "success" | "error";
};

export const Toast = ({ message, type }: IToastProps) => {
  const isSuccess = type === "success";
  const color = isSuccess
    ? "border-emerald-300/30 bg-emerald-500/10 text-emerald-700"
    : "border-rose-300/30 bg-rose-500/10 text-rose-700";

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-2.5 animate-slide-in-right rounded-2xl border px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl",
        color
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
      )}
      {message}
    </div>
  );
};

export const useToast = () => {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  return { toast, show };
};
