import { useState, useEffect, useCallback } from "react";
import { Monitor, Info } from "lucide-react";
import type { ISettings } from "../types";
import { TERMINAL_OPTIONS } from "../types";
import { Dialog, DialogActions } from "./ui/dialog";
import { Select, SelectOption } from "./ui/select";

type ISettingsDialogProps = {
  open: boolean;
  settings: ISettings;
  onSave: (settings: ISettings) => void;
  onCancel: () => void;
};

export const SettingsDialog = ({ open, settings, onSave, onCancel }: ISettingsDialogProps) => {
  const [terminal, setTerminal] = useState(settings.terminal);

  useEffect(() => {
    if (open) setTerminal(settings.terminal);
  }, [open, settings]);

  const handleSubmit = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      onSave({ terminal });
    },
    [terminal, onSave]
  );

  return (
    <Dialog
      open={open}
      title="设置"
      description="这些设置只影响从 Launcher 打开的 Claude 会话。"
      onCancel={onCancel}
    >
      <form onSubmit={handleSubmit}>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-500">
          <Monitor className="h-3.5 w-3.5 text-slate-400" />
          终端模拟器
        </label>
        <Select value={terminal} onChange={(e) => setTerminal(e.target.value)}>
          {TERMINAL_OPTIONS.map((t) => (
            <SelectOption key={t.value} value={t.value}>{t.label}</SelectOption>
          ))}
        </Select>
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          Launcher 会打开新的终端窗口，并注入当前供应商的 Claude 配置。
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <DialogActions confirmLabel="保存设置" onCancel={onCancel} />
        </div>
      </form>
    </Dialog>
  );
};
