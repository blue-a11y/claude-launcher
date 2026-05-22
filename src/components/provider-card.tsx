import { useCallback } from "react";
import { Link2, Key, BadgeCheck, Pencil, Trash2 } from "lucide-react";
import { ClaudeIcon } from "./claude-icon";
import type { IProvider } from "../types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

type IProviderCardProps = {
  provider: IProvider;
  launching: boolean;
  onLaunch: (provider: IProvider) => void;
  onEdit: (provider: IProvider) => void;
  onDelete: (provider: IProvider) => void;
};

const maskKey = (key: string) => {
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}${"•".repeat(Math.min(key.length - 8, 12))}${key.slice(-4)}`;
};

const maskUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.host;
  } catch {
    return url;
  }
};

const authLabel = (authType?: string) => (authType === "api_key" ? "API_KEY" : "AUTH_TOKEN");

export const ProviderCard = ({ provider, launching, onLaunch, onEdit, onDelete }: IProviderCardProps) => {
  const handleLaunch = useCallback(() => onLaunch(provider), [onLaunch, provider]);
  const handleEdit = useCallback(() => onEdit(provider), [onEdit, provider]);
  const handleDelete = useCallback(() => onDelete(provider), [onDelete, provider]);

  return (
    <Card className="group overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200/80 hover:shadow-2xl hover:shadow-violet-100/50">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-950">{provider.name}</h3>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30" title="已配置" />
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{maskUrl(provider.base_url)}</span>
          </div>
        </div>
        <Badge>{authLabel(provider.auth_type)}</Badge>
      </div>

      <div className="mb-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">
            <BadgeCheck className="mr-1 h-3 w-3" />
            {provider.model}
          </Badge>
          <Badge variant="muted">
            <Key className="mr-1 h-3 w-3" />
            {maskKey(provider.api_key)}
          </Badge>
        </div>
        {provider.note && (
          <p className="line-clamp-2 text-sm leading-6 text-slate-500">{provider.note}</p>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
        <Button onClick={handleLaunch} loading={launching} variant="primary" className="flex-1">
          <ClaudeIcon className="h-4 w-4" />
          启动
        </Button>
        <Button onClick={handleEdit} variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button onClick={handleDelete} variant="danger" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
