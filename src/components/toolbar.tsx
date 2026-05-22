import { useCallback, useRef } from "react";
import { Plus, Download, Upload, Import } from "lucide-react";
import { Button } from "./ui/button";

type IToolbarProps = {
  onAdd: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
  onImportCcSwitch?: () => void;
};

export const Toolbar = ({ onAdd, onExport, onImport, onImportCcSwitch }: IToolbarProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImportClick = useCallback(() => fileRef.current?.click(), []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        onImport(reader.result as string);
        if (fileRef.current) fileRef.current.value = "";
      };
      reader.readAsText(file);
    },
    [onImport]
  );

  return (
    <div className="flex items-center gap-2">
      <Button onClick={onAdd} variant="primary">
        <Plus className="h-4 w-4" />
        添加供应商
      </Button>
      <div className="mx-1 h-5 w-px bg-slate-200" />
      {onImportCcSwitch && (
        <Button onClick={onImportCcSwitch} variant="ghost" size="sm">
          <Import className="h-4 w-4" />
          从 CC Switch 导入
        </Button>
      )}
      <Button onClick={onExport} variant="ghost" size="sm">
        <Download className="h-4 w-4" />
        导出
      </Button>
      <Button onClick={handleImportClick} variant="ghost" size="sm">
        <Upload className="h-4 w-4" />
        导入
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
