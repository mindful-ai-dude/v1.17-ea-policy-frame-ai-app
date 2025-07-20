import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="backdrop-blur-[20px] bg-red-500/80 hover:bg-red-600/80 rounded-xl border border-white/20 px-4 py-2 text-white font-semibold transition-all duration-200 min-h-[44px]"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}