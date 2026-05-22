export type IProvider = {
  id: string;
  name: string;
  base_url: string;
  api_key: string;
  auth_type: string;
  model: string;
  note: string;
};

export type IProviderForm = Omit<IProvider, "id">;

export type ISettings = {
  terminal: string;
};

export const DEFAULT_MODEL = "claude-sonnet-4-6";

export const MODEL_OPTIONS = [
  "claude-opus-4-7",
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
] as const;

export const AUTH_TYPE_OPTIONS = [
  { value: "auth_token", label: "ANTHROPIC_AUTH_TOKEN" },
  { value: "api_key", label: "ANTHROPIC_API_KEY" },
] as const;

export const TERMINAL_OPTIONS = [
  { value: "terminal", label: "Terminal" },
  { value: "ghostty", label: "Ghostty" },
  { value: "iterm", label: "iTerm2" },
  { value: "warp", label: "Warp" },
  { value: "alacritty", label: "Alacritty" },
  { value: "kitty", label: "Kitty" },
] as const;
