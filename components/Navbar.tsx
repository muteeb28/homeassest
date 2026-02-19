import { useOutletContext } from "react-router";
import { Box } from "lucide-react";

import type { AuthContext } from "../type";

import { Button } from "./ui/Button";

const Navbar = () => {
  const { isSignedIn, userName, signIn, signOut } =
    useOutletContext<AuthContext>();

  const handleAuthClick = async () => {
    if (isSignedIn) {
      try {
        await signOut();
      } catch (error) {
        console.error("Sign-out failed:", error);
      }
      return;
    }

    try {
      await signIn();
    } catch (error) {
      console.error("Sign-in failed:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="inner">
        <div className="left">
          <div className="brand">
            <Box className="logo" strokeWidth={2.5} />
            <span className="name">HomeAsset</span>
          </div>
          <div className="links">
            <a href="#">Designs</a>
            <a href="#">Services</a>
            <a href="#">How It Works</a>
            <a href="#">Get Estimate</a>
          </div>
        </div>

        <div className="actions">
          {isSignedIn ? (
            <>
              <span className="greeting">
                {userName ? `Hi, ${userName}` : "Signed in"}
              </span>

              <Button size="sm" onClick={handleAuthClick} className="btn">
                Log Out
              </Button>
            </>
          ) : (
            <>
              <button onClick={handleAuthClick} className="login">
                Log In
              </button>
              <a href="#upload" className="cta">
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
