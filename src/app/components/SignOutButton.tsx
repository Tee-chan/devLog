"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg px-3 py-2 text-sm font-medium text-[#8b949e] transition hover:bg-[#21262d] hover:text-[#e6edf3]"
    >
      Sign out
    </button>
  );
}
