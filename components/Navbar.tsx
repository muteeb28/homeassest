import { useOutletContext } from "react-router";
import { Box } from "lucide-react";

import { Button } from "./ui/Button";

const Navbar = () => {
  const { isSignedIn, userName, signIn, signOut } =
    useOutletContext<AuthContext>();

  const handleAuthClick = async () => {
    if (isSignedIn) {
      try {
        await signOut();
      } catch (error) {
        console.error("Puter sign-out failed:", error);
      }
      return;
    }

    try {
      await signIn();
    } catch (error) {
      console.error("Puter sign-in failed:", error);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-sm border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2 cursor-pointer">
            <Box className="w-6 h-6 text-black" strokeWidth={2.5} />
            <span className="text-xl font-serif font-bold text-black tracking-tight">
              Roomify
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#"
              className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
            >
              Product
            </a>
            <a
              href="#"
              className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
            >
              Pricing
            </a>
            <a
              href="#"
              className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
            >
              Community
            </a>
            <a
              href="#"
              className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
            >
              Enterprise
            </a>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isSignedIn && (
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {userName ? `Hi, ${userName}` : "Signed in"}
            </span>
          )}
          {isSignedIn ? (
            <Button size="sm" onClick={handleAuthClick} className="rounded-md">
              Log Out
            </Button>
          ) : (
            <>
              <button
                onClick={handleAuthClick}
                className="text-xs font-bold uppercase tracking-wide text-zinc-900 hover:text-primary transition-colors"
              >
                Log In
              </button>
              <a
                href="#upload"
                className="inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-xs uppercase tracking-wide bg-primary text-white hover:bg-[#EA580C] shadow-sm"
              >
                Get Started
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
