export interface AppSettings {
  // Appearance
  theme: "dark" | "light" | "system";
  accentColor: string;
  // Notifications
  emailNotifications: boolean;
  projectActivityAlerts: boolean;
  // Dashboard
  defaultSortOrder: "updatedAt" | "name" | "status" | "progress";
  showNotificationPanel: boolean;
  showProjectStats: boolean;
  // GitHub
  autoSync: boolean;
  syncFrequency: 5 | 15 | 30 | 60;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  accentColor: "#c4b5fd",
  emailNotifications: true,
  projectActivityAlerts: true,
  defaultSortOrder: "updatedAt",
  showNotificationPanel: true,
  showProjectStats: true,
  autoSync: true,
  syncFrequency: 5,
};

export const ACCENT_COLORS = [
  { name: "Purple", value: "#c4b5fd" },
  { name: "Violet", value: "#a78bfa" },
  { name: "Blue", value: "#60a5fa" },
  { name: "Cyan", value: "#2dd4bf" },
  { name: "Green", value: "#34d399" },
  { name: "Yellow", value: "#fbbf24" },
  { name: "Orange", value: "#fb923c" },
  { name: "Pink", value: "#f472b6" },
  { name: "Rose", value: "#fb7185" },
  { name: "Neutral", value: "#a3a3a3" },
];

export const STORAGE_KEY = "launchpad-settings";
