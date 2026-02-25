import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientSettings from "./ClientSettings";
import { Navigation } from "../Navigation";

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <Navigation />
                <ClientSettings />
            </div>
        </div>
    );
}
