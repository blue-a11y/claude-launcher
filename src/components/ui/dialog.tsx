import type { ReactNode } from "react";
import { Card } from "./card";
import { Button } from "./button";

type IDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onCancel: () => void;
};

export const Dialog = ({ open, title, description, children, footer, onCancel }: IDialogProps) => {
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 p-4 backdrop-blur-sm animate-scale-in"
      onClick={handleBackdrop}
    >
      <Card className="w-full max-w-lg p-6 shadow-2xl shadow-slate-900/10">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {children}
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </Card>
    </div>
  );
};

type IDialogActionsProps = {
  confirmLabel: string;
  cancelLabel?: string;
  disabled?: boolean;
  onCancel: () => void;
};

export const DialogActions = ({ confirmLabel, cancelLabel = "取消", disabled, onCancel }: IDialogActionsProps) => (
  <>
    <Button type="button" variant="ghost" onClick={onCancel}>
      {cancelLabel}
    </Button>
    <Button type="submit" variant="primary" disabled={disabled}>
      {confirmLabel}
    </Button>
  </>
);
