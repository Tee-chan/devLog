import Link from "next/link";
import { Settings, LayoutDashboard, Database } from "lucide-react";

export function Navigation() {
    return (
        <nav className="flex items-center gap-2 mb-8 border-b border-[#21262d] pb-4">
            <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#c9d1d9] hover:text-[#e6edf3] hover:bg-[#161b22] rounded-lg transition-colors"
            >
                <LayoutDashboard className="w-4 h-4" />
                Activity Timeline
            </Link>
            <Link
                href="/dashboard/repos"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#c9d1d9] hover:text-[#e6edf3] hover:bg-[#161b22] rounded-lg transition-colors"
            >
                <Database className="w-4 h-4" />
                Repositories
            </Link>
            <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#c9d1d9] hover:text-[#e6edf3] hover:bg-[#161b22] rounded-lg transition-colors"
            >
                <Settings className="w-4 h-4" />
                Settings
            </Link>
        </nav>
    );
}
