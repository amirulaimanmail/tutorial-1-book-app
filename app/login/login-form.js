"use client";

import { useState } from "react";
import styles from "./login.module.css";

export default function LoginForm({ redirectTo }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not log in.");
      }

      window.location.assign(redirectTo);
    } catch (cause) {
      setError(cause.message || "Could not log in.");
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.brandMark} aria-hidden="true">
          <span />
          <span />
        </div>
        <p className={styles.eyebrow}>WELCOME BACK</p>
        <h1>Your reading list awaits.</h1>
        <p className={styles.intro}>
          Log in to keep your next good read close at hand.
        </p>

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.field}>
            <span>Username</span>
            <input
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
              required
              value={username}
            />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <button className={styles.submit} disabled={submitting} type="submit">
            {submitting ? "Logging in..." : "Log in"}
            {!submitting && <span aria-hidden="true">→</span>}
          </button>
        </form>
      </section>
    </main>
  );
}
