import { AlertTriangle } from "lucide-react";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";

type IConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }: IConfirmDialogProps) => (
  <Dialog open={open} title={title} description={message} onCancel={onCancel}>
    <div className="mt-2 mb-4 flex items-center gap-2 rounded-xl border border-amber-200/60 bg-amber-50/60 px-3 py-2.5 text-xs text-amber-800">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
      此操作无法撤销，请确认。
    </div>
    <div className="flex justify-end gap-3">
      <Button type="button" variant="ghost" onClick={onCancel}>取消</Button>
      <Button type="button" variant="danger" onClick={onConfirm}>删除</Button>
    </div>
  </Dialog>
);
