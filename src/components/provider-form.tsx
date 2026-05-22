import { useState, useCallback, useEffect } from "react";
import { Tag, Link, KeyRound, ShieldCheck, Cpu, FileText } from "lucide-react";
import type { IProvider, IProviderForm } from "../types";
import { DEFAULT_MODEL, MODEL_OPTIONS, AUTH_TYPE_OPTIONS } from "../types";
import { Dialog, DialogActions } from "./ui/dialog";
import { Input } from "./ui/input";
import { Select, SelectOption } from "./ui/select";

type IProviderFormProps = {
  open: boolean;
  provider?: IProvider | null;
  onSubmit: (form: IProviderForm) => void;
  onCancel: () => void;
};

type IFieldProps = {
  label: string;
  children: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
};

const EMPTY_FORM: IProviderForm = {
  name: "",
  base_url: "",
  api_key: "",
  auth_type: "auth_token",
  model: DEFAULT_MODEL,
  note: "",
};

const Field = ({ label, children, hint, icon }: IFieldProps) => (
  <div>
    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-500">
      {icon && <span className="text-slate-400">{icon}</span>}
      {label}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-xs text-amber-600">{hint}</p>}
  </div>
);

const isPresetModel = (model: string) => MODEL_OPTIONS.includes(model as typeof MODEL_OPTIONS[number]);

export const ProviderForm = ({ open, provider, onSubmit, onCancel }: IProviderFormProps) => {
  const [form, setForm] = useState<IProviderForm>(EMPTY_FORM);
  const [customModel, setCustomModel] = useState("");

  useEffect(() => {
    if (open) {
      if (provider) {
        const isCustom = !isPresetModel(provider.model);
        setForm({
          name: provider.name,
          base_url: provider.base_url,
          api_key: provider.api_key,
          auth_type: provider.auth_type || "auth_token",
          model: provider.model,
          note: provider.note,
        });
        setCustomModel(isCustom ? provider.model : "");
      } else {
        setForm(EMPTY_FORM);
        setCustomModel("");
      }
    }
  }, [open, provider]);

  const handleChange = useCallback((field: keyof IProviderForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      onSubmit(form);
    },
    [form, onSubmit]
  );

  const handleModelChange = useCallback(
    (value: string) => {
      if (value === "__custom__") {
        handleChange("model", customModel || "");
        return;
      }
      setCustomModel("");
      handleChange("model", value);
    },
    [customModel, handleChange]
  );

  const handleCustomModelChange = useCallback(
    (value: string) => {
      setCustomModel(value);
      handleChange("model", value);
    },
    [handleChange]
  );

  const isEdit = !!provider;
  const invalidUrl = form.base_url && !form.base_url.startsWith("http");
  const submitDisabled = !form.name || !form.base_url || !form.api_key || !form.model;

  return (
    <Dialog
      open={open}
      title={isEdit ? "编辑供应商" : "添加供应商"}
      description="为 Claude Code 配置独立的供应商，不会修改你的本地默认配置。"
      onCancel={onCancel}
    >
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <Field label="名称" icon={<Tag className="h-3.5 w-3.5" />}>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="例如：Kimi"
            />
          </Field>
          <Field label="Base URL" hint={invalidUrl ? "Base URL 应以 http 或 https 开头。" : undefined} icon={<Link className="h-3.5 w-3.5" />}>
            <Input
              value={form.base_url}
              onChange={(e) => handleChange("base_url", e.target.value)}
              placeholder="https://api.example.com"
            />
          </Field>
          <Field label="API Key / Token" icon={<KeyRound className="h-3.5 w-3.5" />}>
            <Input
              value={form.api_key}
              onChange={(e) => handleChange("api_key", e.target.value)}
              placeholder="sk-..."
              type="password"
            />
          </Field>
          <Field label="鉴权方式" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
            <Select value={form.auth_type} onChange={(e) => handleChange("auth_type", e.target.value)}>
              {AUTH_TYPE_OPTIONS.map((t) => (
                <SelectOption key={t.value} value={t.value}>{t.label}</SelectOption>
              ))}
            </Select>
          </Field>
          <Field label="模型" icon={<Cpu className="h-3.5 w-3.5" />}>
            <Select value={isPresetModel(form.model) ? form.model : "__custom__"} onChange={(e) => handleModelChange(e.target.value)}>
              {MODEL_OPTIONS.map((m) => (
                <SelectOption key={m} value={m}>{m}</SelectOption>
              ))}
              <SelectOption value="__custom__">自定义...</SelectOption>
            </Select>
            {!isPresetModel(form.model) && (
              <Input
                value={form.model}
                className="mt-2"
                placeholder="输入自定义模型名"
                autoFocus
                onChange={(e) => handleCustomModelChange(e.target.value)}
              />
            )}
          </Field>
          <Field label="备注" icon={<FileText className="h-3.5 w-3.5" />}>
            <Input
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
              placeholder="可选备注"
            />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <DialogActions confirmLabel={isEdit ? "保存供应商" : "添加供应商"} disabled={submitDisabled} onCancel={onCancel} />
        </div>
      </form>
    </Dialog>
  );
};
