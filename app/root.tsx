import { useEffect, useRef, useState } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "../index.css";
import { authClient } from "../lib/auth-client";
import SignInModal from "../components/SignInModal";

// Inject Puter.js SDK dynamically so it actually executes
function usePuterScript() {
  useEffect(() => {
    if (document.getElementById("puter-sdk")) return;
    const script = document.createElement("script");
    script.id = "puter-sdk";
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    document.head.appendChild(script);
  }, []);
}

export function HydrateFallback() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>HomeAsset</title>
        <Links />
      </head>
      <body style={{ margin: 0, background: "#fdfbf7", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "16px", fontFamily: "Inter, sans-serif" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #f3f4f6", borderTopColor: "#f97316", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </body>
    </html>
  );
}

export default function Root() {
  usePuterScript();
  const session = authClient.useSession();
  const [showSignIn, setShowSignIn] = useState(false);
  const signInResolveRef = useRef<((value: boolean) => void) | null>(null);

  const isSignedIn = !!session.data?.user;
  const userName = session.data?.user?.name ?? null;
  const userId = session.data?.user?.id ?? null;

  const refreshAuth = async () => {
    const { data } = await authClient.getSession();
    return !!data?.user;
  };

  const signIn = async () => {
    if (isSignedIn) return true;

    return new Promise<boolean>((resolve) => {
      signInResolveRef.current = resolve;
      setShowSignIn(true);
    });
  };

  const handleSignInSuccess = () => {
    setShowSignIn(false);
    signInResolveRef.current?.(true);
    signInResolveRef.current = null;
  };

  const handleSignInCancel = () => {
    setShowSignIn(false);
    signInResolveRef.current?.(false);
    signInResolveRef.current = null;
  };

  const signOut = async () => {
    await authClient.signOut();
    return true;
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>HomeAsset | AI Architectural Visualization</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <div className="min-h-screen bg-background text-foreground">
          <SignInModal
            isOpen={showSignIn}
            onSuccess={handleSignInSuccess}
            onCancel={handleSignInCancel}
          />
          <div className="relative z-10">
            <Outlet
              context={{
                isSignedIn,
                userName,
                userId,
                refreshAuth,
                signIn,
                signOut,
              }}
            />
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
