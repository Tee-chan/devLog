import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "../components/SignOutButton";
import { SyncButton } from "./SyncButton";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) redirect("/");

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

        <section className="bg-[#161b22] border border-[#21262d] rounded-xl p-6">
          <h2 className="text-xl font-mono font-semibold text-[#e6edf3] mb-4">
            Repositories
          </h2>
          <div className="text-[#8b949e] border border-dashed border-[#30363d] rounded-lg p-12 text-center font-mono text-sm">
            loading your repositories...
          </div>
        </section>

       <section className="bg-[#161b22] border border-[#21262d] rounded-xl p-6">
         <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-mono font-semibold text-[#e6edf3]">
             Recent Activity
           </h2>
           <SyncButton />
         </div>

       <div className="text-[#8b949e] border border-dashed border-[#30363d] rounded-lg p-12 text-center">
         No repository selected yet. Pick one above to start tracking commits.
       </div>

         <div className="space-y-4 hidden">
           <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
             <div className="flex items-center justify-between">
               <div>
                 <h3 className="font-mono text-lg font-semibold text-[#e6edf3]">
                   owner / repo
                 </h3>
                 <p className="text-xs text-[#8b949e]">
                   Last synced: —
                 </p>
               </div>
               <span className="px-3 py-1 text-xs font-medium text-[#2ea043] bg-[#2ea0431a] border border-[#2ea043] rounded-full">
                 Connected
               </span>
             </div>
           </div>
         </div>
       </section>

       <section className="grid grid-cols-4 gap-4">
         {[
           { label: "Commits", value: "—" },
           { label: "Lines added", value: "—" },
           { label: "Lines removed", value: "—" },
           { label: "Files changed", value: "—" },
         ].map((stat) => (
           <div
             key={stat.label}
             className="bg-[#161b22] border border-[#21262d] rounded-xl p-4 text-center"
           >
             <p className="text-2xl font-mono font-bold text-[#e6edf3]">
               {stat.value}
             </p>
             <p className="text-xs text-[#8b949e] mt-1">{stat.label}</p>
           </div>
         ))}
       </section>

       </div>
     </div>
   );
 }

