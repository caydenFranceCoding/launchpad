"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/80 backdrop-blur-sm">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        {/* Mobile nav */}
        <Sheet>
          <SheetTrigger className="md:hidden text-zinc-400 hover:text-white p-2 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-[#050505] border-white/[0.06] p-0">
            <div className="p-6">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-300/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-white">Launchpad</span>
              </Link>
            </div>
            <nav className="px-3 space-y-1">
              {[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Settings", href: "/settings" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-purple-300/10 text-purple-300"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="md:hidden" />

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-9 w-9 rounded-full cursor-pointer outline-none">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name ?? ""} />
                <AvatarFallback className="bg-purple-300/20 text-purple-300 text-sm">
                  {session?.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-zinc-950 border-white/10">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                <p className="text-xs text-zinc-500">{session?.user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="text-zinc-400 focus:text-white focus:bg-white/[0.04] cursor-pointer"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-zinc-400 focus:text-white focus:bg-white/[0.04] cursor-pointer"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
