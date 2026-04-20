import { GalaxyBackground } from "@/components/galaxy-background";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden">
      <GalaxyBackground />

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Outer glow ring */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-purple-500/30 via-indigo-500/10 to-transparent blur-[1px]" />

        {/* Card */}
        <div className="relative rounded-2xl border border-white/[0.08] bg-zinc-950/70 backdrop-blur-2xl shadow-[0_0_80px_-20px_rgba(139,92,246,0.25)] overflow-hidden">
          {/* Subtle top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />

          {/* Content */}
          <div className="relative px-8 pt-10 pb-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-5">
                {/* Logo glow */}
                <div className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-xl scale-150" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/25 to-indigo-500/15 border border-purple-400/20 flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-purple-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="text-[1.65rem] font-bold tracking-tight text-white mb-1.5">
                Launchpad
              </h1>
              <p className="text-sm text-zinc-500 text-center leading-relaxed">
                Track your projects from idea to launch.
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.06]" />
              <span className="text-[11px] uppercase tracking-widest text-zinc-600 font-medium">Continue with</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.06]" />
            </div>

            {/* Sign in button */}
            <a
              href="/api/auth/signin/github"
              className="group relative w-full flex items-center justify-center gap-2.5 h-11 rounded-xl bg-white text-zinc-900 font-medium text-sm transition-all duration-200 hover:bg-zinc-100 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.15)] active:scale-[0.98]"
            >
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Sign in with GitHub
            </a>

            {/* Footer text */}
            <p className="mt-5 text-center text-[11px] text-zinc-600 leading-relaxed">
              By signing in, you agree to let us track your launches into orbit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
