import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignInButton } from "./components/SignInButtonGithub";


export default async function HomePage() {
const session = await auth();

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <header className="border-b border-[#21262d] bg-[#0d1117]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="font-mono text-lg font-semibold tracking-tight text-[#e6edf3]"
          >
            devLog
          </Link>
          <nav className="flex items-center gap-4">
              <SignInButton />
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[#21262d]">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, #388bfd33, transparent)`,
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32">
            <h1 className="font-mono text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Changelogs from your repos,
              <br />
              <span className="text-[#58a6ff]">in one place</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-[#8b949e]">
              Connect GitHub and see release notes and commit history across
              projects. No more digging through tags and releases.
            </p>
            <div className="mt-5">
              <SignInButton />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="font-mono text-2xl font-semibold text-[#e6edf3]">
            Why use it
          </h2>
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "One dashboard",
                description:
                  "All your repos’ releases and recent commits in a single view.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                  />
                ),
              },
              {
                title: "GitHub-native",
                description:
                  "Uses your GitHub account and repo access. No extra config.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                  />
                ),
              },
              {
                title: "Focus on shipping",
                description:
                  "Spend less time hunting for “what changed” and more time building.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ),
              },
            ].map((item) => (
              <li
                key={item.title}
                className="rounded-xl border border-[#21262d] bg-[#161b22] p-6 transition hover:border-[#30363d]"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#21262d] text-[#58a6ff]">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {item.icon}
                  </svg>
                </span>
                <h3 className="mt-4 font-mono font-semibold text-[#e6edf3]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[#8b949e]">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-[#21262d] bg-[#161b22]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-8 text-center sm:p-12">
              <h2 className="font-mono text-2xl font-semibold text-[#e6edf3]">
                Ready to see your changelogs?
              </h2>
              <p className="mt-2 text-[#8b949e]">
                Sign in with GitHub to get started. No credit card required.
              </p>
              <div className="mt-6">
                <SignInButton />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#21262d] py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-sm text-[#8b949e]">
            devLog · Changelogs from your repos, in one place
          </p>
        </div>
      </footer>
    </div>
  );
}
