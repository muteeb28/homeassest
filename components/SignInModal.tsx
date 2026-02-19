import React, { useState } from "react";
import { User } from "lucide-react";

import { Button } from "./ui/Button";
import { authClient } from "@/lib/auth-client";
import type { SignInModalProps } from "@/type";

const SignInModal = ({ isOpen, onSuccess, onCancel }: SignInModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
        });
        if (signUpError) {
          setError(signUpError.message ?? "Sign up failed. Please try again.");
          setIsLoading(false);
          return;
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (signInError) {
          setError(signInError.message ?? "Invalid email or password.");
          setIsLoading(false);
          return;
        }
      }
      resetForm();
      onSuccess();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsSignUp(false);
    onCancel();
  };

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setError(null);
  };

  return (
    <div className="sign-in-modal animate-in fade-in duration-200">
      <div className="panel">
        <div className="icon">
          <User className="alert" />
        </div>

        <h3>{isSignUp ? "Create Account" : "Welcome Back"}</h3>
        <p>
          {isSignUp
            ? "Sign up to get started with HomeAsset."
            : "Sign in to continue with your projects."}
        </p>

        <form onSubmit={handleSubmit} className="form">
          {isSignUp && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="input"
              autoFocus
              maxLength={50}
              required
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="input"
            autoFocus={!isSignUp}
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input"
            minLength={8}
            required
          />

          {error && <p className="error">{error}</p>}

          <div className="actions">
            <Button
              type="submit"
              fullWidth
              className="confirm"
              disabled={isLoading}
            >
              {isLoading
                ? "Please wait..."
                : isSignUp
                  ? "Sign Up"
                  : "Sign In"}
            </Button>

            <button type="button" onClick={toggleMode} className="toggle">
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>

            <button type="button" onClick={handleCancel} className="cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInModal;
