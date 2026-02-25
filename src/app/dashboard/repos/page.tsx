import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { fetchUserRepos } from "@/lib/github";
import { ClientRepoSelect } from "../ClientRepoSelect";
import { Navigation } from "../Navigation";

export default async function RepositoriesPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    const repos = session.accessToken ? await fetchUserRepos(session.accessToken) : [];

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-center bg-[#161b22] border border-[#21262d] rounded-xl p-6">
                    <div>
                        <h1 className="text-2xl font-mono font-bold text-[#e6edf3]">
                            Repositories
                        </h1>
                        <p className="text-[#8b949e] mt-1">
                            Select repositories to sync to your changelog.
                        </p>
                    </div>
                </header>

                <Navigation />

                <ClientRepoSelect repos={repos} showTimeline={false} />
            </div>
        </div>
    );
}
