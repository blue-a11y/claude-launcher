import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { IProvider, IProviderForm } from "../types";
import { DEFAULT_MODEL } from "../types";

type ToastFn = (msg: string, type: "success" | "error") => void;

export const useProviders = (toast: ToastFn) => {
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [launchingIds, setLaunchingIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const list = await invoke<IProvider[]>("load_providers");
      setProviders(list);
    } catch (e) {
      toast(`加载失败：${e}`, "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(
    async (list: IProvider[]) => {
      try {
        await invoke("save_providers", { providers: list });
        setProviders(list);
      } catch (e) {
        toast(`保存失败：${e}`, "error");
      }
    },
    [toast]
  );

  const addProvider = useCallback(
    async (form: IProviderForm) => {
      const newProvider: IProvider = { ...form, id: crypto.randomUUID() };
      await persist([...providers, newProvider]);
      toast("添加成功", "success");
    },
    [providers, persist, toast]
  );

  const updateProvider = useCallback(
    async (id: string, form: IProviderForm) => {
      const list = providers.map((p) => (p.id === id ? { ...p, ...form } : p));
      await persist(list);
      toast("更新成功", "success");
    },
    [providers, persist, toast]
  );

  const deleteProvider = useCallback(
    async (id: string) => {
      const list = providers.filter((p) => p.id !== id);
      await persist(list);
      toast("删除成功", "success");
    },
    [providers, persist, toast]
  );

  const launch = useCallback(
    async (provider: IProvider, terminal: string) => {
      if (launchingIds.has(provider.id)) return;
      setLaunchingIds((prev) => new Set(prev).add(provider.id));
      try {
        await invoke("launch_terminal", {
          terminal,
          name: provider.name,
          baseUrl: provider.base_url,
          apiKey: provider.api_key,
          authType: provider.auth_type || "auth_token",
          model: provider.model,
        });
        toast(`正在启动 ${provider.name}...`, "success");
      } catch (e) {
        toast(`启动失败：${e}`, "error");
      } finally {
        window.setTimeout(() => {
          setLaunchingIds((prev) => {
            const next = new Set(prev);
            next.delete(provider.id);
            return next;
          });
        }, 1500);
      }
    },
    [launchingIds, toast]
  );

  const handleExport = useCallback(async () => {
    try {
      const json = await invoke<string>("export_config", { providers });
      await navigator.clipboard.writeText(json);
      toast("配置已复制到剪贴板（不包含 API Key）", "success");
    } catch (e) {
      toast(`导出失败：${e}`, "error");
    }
  }, [providers, toast]);

  const handleImport = useCallback(
    async (json: string) => {
      try {
        const imported = await invoke<IProvider[]>("import_config", { json });
        const normalized = imported.map((p) => ({
          ...p,
          auth_type: p.auth_type || "auth_token",
        }));
        await persist([...providers, ...normalized]);
        toast(`已导入 ${normalized.length} 个供应商`, "success");
      } catch (e) {
        toast(`导入失败：${e}`, "error");
      }
    },
    [providers, persist, toast]
  );

  const importFromCcSwitch = useCallback(async () => {
    try {
      const imported = await invoke<IProvider[]>("import_from_cc_switch");
      if (imported.length === 0) {
        toast("CC Switch 中没有找到 Claude 供应商", "error");
        return;
      }
      const existingIds = new Set(providers.map((p) => p.id));
      const newProviders = imported.filter((p) => !existingIds.has(p.id));
      if (newProviders.length === 0) {
        toast("所有 CC Switch 供应商已存在", "success");
        return;
      }
      await persist([...providers, ...newProviders]);
      toast(`已从 CC Switch 导入 ${newProviders.length} 个供应商`, "success");
    } catch (e) {
      toast(`导入失败：${e}`, "error");
    }
  }, [providers, persist, toast]);

  return {
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
    DEFAULT_MODEL,
  };
};
