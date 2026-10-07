import { Suspense } from "react";
import Link from "next/link";
import { getSessionUser, safeRedirectPath } from "@/lib/auth";
import LoginForm from "./login-form";
import styles from "./login.module.css";

export const metadata = {
  title: "Log in | Reading List",
};

function LoadingLogin() {
  return (
    <main>
      <p>Loading login...</p>
    </main>
  );
}

export default function LoginPage({ searchParams }) {
  return (
    <Suspense fallback={<LoadingLogin />}>
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginPageContent({ searchParams }) {
  const username = await getSessionUser();
  const params = await searchParams;
  const redirectTo = safeRedirectPath(params?.next);

  if (username) {
    return (
      <main className={styles.page}>
        <section className={styles.panel}>
          <p className={styles.eyebrow}>YOU’RE SIGNED IN</p>
          <h1>Your reading list awaits.</h1>
          <Link className={styles.alreadySignedIn} href="/">
            Go to your reading list <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
    );
  }

  return <LoginForm redirectTo={redirectTo} />;
}
