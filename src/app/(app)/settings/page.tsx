"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your account and preferences.</p>
      </div>

      <Card className="bg-zinc-950/50 border-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={session?.user?.image ?? ""} />
              <AvatarFallback className="bg-purple-300/20 text-purple-300 text-xl">
                {session?.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold text-white">{session?.user?.name}</p>
              <p className="text-sm text-zinc-500">{session?.user?.email}</p>
            </div>
          </div>
          <Separator className="bg-white/[0.06]" />
          <div className="space-y-2">
            <p className="text-xs text-zinc-600">
              Signed in via GitHub. Your GitHub access token is used to fetch repository stats.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-950/50 border-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">
            Launchpad helps you track your projects from idea to launch and beyond.
            Built with Next.js, PostgreSQL, and the GitHub API.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
