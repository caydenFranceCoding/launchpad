"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useSettings } from "@/components/settings-provider";
import { ACCENT_COLORS } from "@/lib/settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cn } from "@/lib/utils";

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function AppearanceTab() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(["dark", "light", "system"] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => updateSettings({ theme })}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                  settings.theme === theme
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {theme}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Accent Color
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => updateSettings({ accentColor: color.value })}
                className={cn(
                  "w-8 h-8 rounded-full transition-all",
                  settings.accentColor === color.value
                    ? "ring-2 ring-offset-2 ring-offset-background ring-current"
                    : "hover:scale-110"
                )}
                style={{
                  backgroundColor: color.value,
                  color: color.value,
                }}
                title={color.name}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationsTab() {
  const { settings, updateSettings } = useSettings();

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <SettingRow
          label="Email Notifications"
          description="Receive email updates about your projects."
        >
          <Switch
            checked={settings.emailNotifications}
            onCheckedChange={(v) => updateSettings({ emailNotifications: v })}
          />
        </SettingRow>
        <SettingRow
          label="Project Activity Alerts"
          description="Get notified about task completions and milestone updates."
        >
          <Switch
            checked={settings.projectActivityAlerts}
            onCheckedChange={(v) =>
              updateSettings({ projectActivityAlerts: v })
            }
          />
        </SettingRow>
      </CardContent>
    </Card>
  );
}

function DashboardTab() {
  const { settings, updateSettings } = useSettings();

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Dashboard Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <SettingRow
          label="Default Sort Order"
          description="How projects are sorted on the dashboard."
        >
          <Select
            value={settings.defaultSortOrder}
            onValueChange={(v) =>
              updateSettings({
                defaultSortOrder: v as typeof settings.defaultSortOrder,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Recently Updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow
          label="Show Notification Panel"
          description="Display the notification panel on the dashboard."
        >
          <Switch
            checked={settings.showNotificationPanel}
            onCheckedChange={(v) =>
              updateSettings({ showNotificationPanel: v })
            }
          />
        </SettingRow>
        <SettingRow
          label="Show Project Stats"
          description="Display project count and status summary."
        >
          <Switch
            checked={settings.showProjectStats}
            onCheckedChange={(v) => updateSettings({ showProjectStats: v })}
          />
        </SettingRow>
      </CardContent>
    </Card>
  );
}

function GitHubTab() {
  const { settings, updateSettings } = useSettings();

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          GitHub Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <SettingRow
          label="Auto-sync Repositories"
          description="Automatically sync GitHub data for linked repositories."
        >
          <Switch
            checked={settings.autoSync}
            onCheckedChange={(v) => updateSettings({ autoSync: v })}
          />
        </SettingRow>
        <SettingRow
          label="Sync Frequency"
          description="How often to sync data from GitHub."
        >
          <Select
            value={String(settings.syncFrequency)}
            onValueChange={(v) =>
              updateSettings({
                syncFrequency: Number(v) as typeof settings.syncFrequency,
              })
            }
            disabled={!settings.autoSync}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Every 5 minutes</SelectItem>
              <SelectItem value="15">Every 15 minutes</SelectItem>
              <SelectItem value="30">Every 30 minutes</SelectItem>
              <SelectItem value="60">Every hour</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </CardContent>
    </Card>
  );
}

function AccountTab() {
  const { data: session, update: updateSession } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSaveName() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      await updateSession();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    const res = await fetch("/api/user/account", { method: "DELETE" });
    if (res.ok) {
      signOut({ callbackUrl: "/login" });
    }
    setDeleting(false);
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={session?.user?.image ?? ""} />
              <AvatarFallback className="bg-primary/20 text-primary text-xl">
                {session?.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {session?.user?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
          </div>
          <Separator className="bg-border" />
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Display Name
            </Label>
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="max-w-xs bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button
                onClick={handleSaveName}
                disabled={saving || !name.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? "Saving..." : saved ? "Saved!" : "Save"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Signed in via GitHub. Your GitHub access token is used to fetch
            repository stats.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="border-border text-foreground hover:bg-muted"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border border-destructive/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-destructive">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Account"
        description="Are you sure you want to delete your account? All your projects, tasks, and data will be permanently removed. This cannot be undone."
        onConfirm={handleDeleteAccount}
        loading={deleting}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and preferences.
        </p>
      </div>

      <Tabs defaultValue="appearance">
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="appearance">
          <AppearanceTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>
        <TabsContent value="github">
          <GitHubTab />
        </TabsContent>
        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
