import { useState, useCallback } from "react";
import { Settings, Loader2 } from "lucide-react";
import { ClaudeIcon } from "./components/claude-icon";
import { useProviders } from "./hooks/use-providers";
import { useSettings } from "./hooks/use-settings";
import { ProviderCard } from "./components/provider-card";
import { ProviderForm } from "./components/provider-form";
import { ConfirmDialog } from "./components/confirm-dialog";
import { SettingsDialog } from "./components/settings-dialog";
import { Toolbar } from "./components/toolbar";
import { Toast, useToast } from "./components/toast";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import type { IProvider, IProviderForm, ISettings } from "./types";

type IEmptyStateProps = {
  onAdd: () => void;
};

const EmptyState = ({ onAdd }: IEmptyStateProps) => (
  <Card className="flex flex-col items-center px-8 py-16 text-center">
    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 text-violet-600 shadow-sm">
      <ClaudeIcon className="h-8 w-8" />
    </div>
    <h2 className="text-lg font-semibold text-slate-950">还没有供应商配置</h2>
    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
      添加一个供应商后，就可以用独立的 Base URL、鉴权和模型配置启动 Claude Code。
    </p>
    <Button onClick={onAdd} variant="primary" className="mt-6">
      <ClaudeIcon className="h-4 w-4" />
      添加第一个供应商
    </Button>
  </Card>
);

const App = () => {
  const { toast, show } = useToast();
  const {
    providers,
    loading,
    addProvider,
    updateProvider,
    deleteProvider,
    launch,
    launchingIds,
    handleExport,
    handleImport,
    importFromCcSwitch,
  } = useProviders(show);
  const { settings, save: saveSettings } = useSettings(show);

  const [formOpen, setFormOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editing, setEditing] = useState<IProvider | null>(null);
  const [deleting, setDeleting] = useState<IProvider | null>(null);

  const handleAdd = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((provider: IProvider) => {
    setEditing(provider);
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (form: IProviderForm) => {
      if (editing) {
        await updateProvider(editing.id, form);
      } else {
        await addProvider(form);
      }
      setFormOpen(false);
      setEditing(null);
    },
    [editing, updateProvider, addProvider]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (deleting) {
      await deleteProvider(deleting.id);
      setDeleting(null);
    }
  }, [deleting, deleteProvider]);

  const handleLaunch = useCallback(
    (provider: IProvider) => launch(provider, settings.terminal),
    [launch, settings.terminal]
  );

  const handleSaveSettings = useCallback(
    async (s: ISettings) => {
      await saveSettings(s);
      setSettingsOpen(false);
    },
    [saveSettings]
  );

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        {/* Drag region for macOS overlay title bar */}
        <div
          data-tauri-drag-region
          className="absolute left-0 right-0 top-0 z-50 flex h-11 items-center justify-center"
        >
          <span className="text-xs font-medium text-slate-400 select-none">Claude Launcher</span>
        </div>

        <header className="mb-8 mt-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-violet-600 shadow-sm">
                <ClaudeIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">Claude Launcher</h1>
                <p className="text-sm text-slate-500">在不影响本地默认配置的情况下切换 Claude Code 供应商。</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="muted">{providers.length} 个供应商</Badge>
              <Badge variant="muted">终端：{settings.terminal}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Toolbar onAdd={handleAdd} onExport={handleExport} onImport={handleImport} onImportCcSwitch={importFromCcSwitch} />
            <Button onClick={() => setSettingsOpen(true)} variant="secondary" size="icon" aria-label="打开设置">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1">
          {loading ? (
            <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              正在加载供应商...
            </Card>
          ) : providers.length === 0 ? (
            <EmptyState onAdd={handleAdd} />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  launching={launchingIds.has(p.id)}
                  onLaunch={handleLaunch}
                  onEdit={handleEdit}
                  onDelete={setDeleting}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <ProviderForm
        open={formOpen}
        provider={editing}
        onSubmit={handleSubmit}
        onCancel={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />
      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        onSave={handleSaveSettings}
        onCancel={() => setSettingsOpen(false)}
      />
      <ConfirmDialog
        open={!!deleting}
        title="删除供应商"
        message={`确定要删除「${deleting?.name}」吗？此操作无法撤销。`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting(null)}
      />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default App;
