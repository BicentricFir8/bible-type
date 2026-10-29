
"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const cleanUsername = username.trim().toLowerCase();

    if (
      mode === "signup" &&
      !/^[a-z0-9_]{3,20}$/.test(cleanUsername)
    ) {
      setMessage(
        "Username must be 3–20 characters using letters, numbers, or underscores."
      );
      return;
    }

    if (password.length < 8) {
      setMessage("Your password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { username: cleanUsername },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (error) throw error;

        if (data.session) {
          setMessage("Account created! You're signed in.");
        } else {
          setMessage(
            "Registration received! Check your email to confirm your account before signing in."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setMessage("Successfully signed in! Your account is connected.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#101522",
        color: "#f4f6fb",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 440,
          padding: 32,
          background: "#202a3b",
          borderRadius: 18,
          boxSizing: "border-box",
        }}
      >
        <a
          href="/"
          style={{
            color: "#8db7ff",
            textDecoration: "none",
          }}
        >
          ← Back to Bible Type
        </a>

        <h1
          style={{
            color: "#8db7ff",
            fontSize: 32,
            marginTop: 28,
          }}
        >
          BIBLE TYPE
        </h1>

        <h2>
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h2>

        <p style={{ color: "#c0c9d8", lineHeight: 1.6 }}>
          {mode === "signup"
            ? "Join the community and start your typing journey."
            : "Sign in to your Bible Type account."}
        </p>

        <div style={{ display: "flex", gap: 10, margin: "24px 0" }}>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setMessage("");
            }}
            style={tabStyle(mode === "signup")}
          >
            Sign Up
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
            style={tabStyle(mode === "login")}
          >
            Sign In
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label style={labelStyle}>
              Username
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                minLength={3}
                maxLength={20}
                autoComplete="username"
                required
                style={inputStyle}
              />
              <small style={{ color: "#aebbd0" }}>
                3–20 letters, numbers, or underscores.
              </small>
            </label>
          )}

          <label style={labelStyle}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              required
              style={inputStyle}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 9,
              border: 0,
              background: loading ? "#687b9b" : "#8db7ff",
              color: "#101522",
              fontWeight: "bold",
              fontSize: 16,
              cursor: loading ? "wait" : "pointer",
              marginTop: 8,
            }}
          >
            {loading
              ? "Please wait..."
              : mode === "signup"
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        {message && (
          <p
            role="status"
            aria-live="polite"
            style={{
              background: "#151e2c",
              padding: 14,
              borderRadius: 8,
              lineHeight: 1.6,
              overflowWrap: "anywhere",
            }}
          >
            {message}
          </p>
        )}

        <p
          style={{
            fontSize: 12,
            color: "#aebbd0",
            lineHeight: 1.6,
            marginTop: 24,
          }}
        >
          Use an email address you can access. Never share your password
          with anyone.
        </p>
      </section>
    </main>
  );
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: active ? "2px solid #8db7ff" : "1px solid #526078",
    background: active ? "#303f57" : "#182131",
    color: "#f4f6fb",
    fontWeight: "bold",
    cursor: "pointer",
  };
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 18,
  fontWeight: "bold",
};

const inputStyle: React.CSSProperties = {
  display: "block",
  boxSizing: "border-box",
  width: "100%",
  padding: 13,
  marginTop: 8,
  marginBottom: 6,
  borderRadius: 8,
  border: "1px solid #526078",
  background: "#151e2c",
  color: "#ffffff",
  fontSize: 16,
};
