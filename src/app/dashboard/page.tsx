import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "../components/SignOutButton";
import { SyncButton } from "./SyncButton";
import { fetchUserRepos } from "@/lib/github";
import { ClientRepoSelect } from "./ClientRepoSelect";
import { Navigation } from "./Navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) redirect("/");

  const repos = session.accessToken ? await fetchUserRepos(session.accessToken) : [];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        <header className="flex justify-between items-center bg-[#161b22] border border-[#21262d] rounded-xl p-6">
          <div>
            <h1 className="text-2xl font-mono font-bold text-[#e6edf3]">
              Welcome, {session.user.name || session.user.email}
            </h1>
            <p className="text-[#8b949e] mt-1">
              Your developer changelog dashboard.
            </p>
          </div>


          <div className="flex items-center gap-4">
            {session.user.image && (
              <img
                src={session.user.image}
                alt="Profile"
                className="w-10 h-10 rounded-full border border-[#21262d]"
              />
            )}
            <SignOutButton />
          </div>

        </header>

        <Navigation />

        <ClientRepoSelect repos={repos} />



      </div>
    </div>
  );
}

