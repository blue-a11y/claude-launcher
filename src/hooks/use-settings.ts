import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { ISettings } from "../types";

type ToastFn = (msg: string, type: "success" | "error") => void;

export const useSettings = (toast: ToastFn) => {
  const [settings, setSettings] = useState<ISettings>({ terminal: "terminal" });

  const load = useCallback(async () => {
    try {
      const s = await invoke<ISettings>("load_settings");
      setSettings(s);
    } catch {
      // use default
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (s: ISettings) => {
      try {
        await invoke("save_settings", { settings: s });
        setSettings(s);
        toast("设置已保存", "success");
      } catch (e) {
        toast(`保存失败：${e}`, "error");
      }
    },
    [toast]
  );

  return { settings, save };
};
