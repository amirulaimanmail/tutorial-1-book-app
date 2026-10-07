import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LoginForm from "../../login/login-form";
import styles from "./page.module.css";

export const instant = false;

export const metadata = {
  title: "Reading item | Reading List",
};

function LoadingBookDetail() {
  return (
    <main>
      <p>Loading reading item...</p>
    </main>
  );
}

export default function BookDetailPage({ params }) {
  return (
    <Suspense fallback={<LoadingBookDetail />}>
      <AuthenticatedBookDetail params={params} />
    </Suspense>
  );
}

async function AuthenticatedBookDetail({ params }) {
  const { id } = await params;
  if (!(await getSessionUser())) {
    return <LoginForm redirectTo={`/books/${id}`} />;
  }

  const book = await prisma.book.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      url: true,
    },
  });

  if (!book) notFound();

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link className={styles.brand} href="/">
            <span className={styles.brandMark} aria-hidden="true">
              <span />
              <span />
            </span>
            <span>reading list</span>
          </Link>
          <Link className={styles.backLink} href="/">
            <span aria-hidden="true">←</span> Back to reading list
          </Link>
        </header>

        <article className={styles.detailCard}>
          <div className={styles.details}>
            <p className={styles.eyebrow}>SAVED FOR LATER</p>
            <h1>{book.name}</h1>
            <div className={styles.divider} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <h2>Notes</h2>
            <p className={styles.description}>{book.description}</p>
            {book.url ? (
              <a
                className={styles.shelfButton}
                href={book.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                Open reading link <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <p className={styles.missingLink}>
                Edit this item to add a reading link.
              </p>
            )}
            <Link className={styles.returnLink} href="/">
              <span aria-hidden="true">←</span> Return to reading list
            </Link>
          </div>
        </article>

        <footer className={styles.footer}>
          A little space for what you want to read next{" "}
          <span aria-hidden="true">✳</span>
        </footer>
      </div>
    </main>
  );
}
