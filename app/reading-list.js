"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

async function getBooks() {
  const response = await fetch("/api/books");
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Could not load your reading list.");
  }

  return result.books;
}

export default function ReadingList({ username }) {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    getBooks()
      .then((loadedBooks) => {
        if (active) setBooks(loadedBooks);
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setUrl("");
    setError("");
  }

  function startEditing(book) {
    setEditingId(book.id);
    setName(book.name);
    setDescription(book.description);
    setUrl(book.url);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitReadingItem(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        editingId ? `/api/books/${editingId}` : "/api/books",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, url }),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not save this reading item.");
      }

      setBooks(await getBooks());
      setNotice(
        editingId ? "Reading item updated." : "Added to your reading list.",
      );
      resetForm();
    } catch (cause) {
      setError(cause.message || "Could not save this reading item.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBook(book) {
    if (!window.confirm(`Remove "${book.name}" from your reading list?`)) return;

    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not remove this item.");
      }

      setBooks(await getBooks());
      setNotice("Reading item removed.");
      if (editingId === book.id) resetForm();
    } catch (cause) {
      setError(cause.message || "Could not remove this item.");
    }
  }

  async function logOut() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Could not log out. Please try again.");
      }
      router.push("/login");
    } catch (cause) {
      setError(cause.message);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              <span />
              <span />
            </span>
            <span>reading list</span>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.headerNote}>Signed in as {username}</span>
            <button
              className={styles.logoutButton}
              onClick={logOut}
              type="button"
            >
              Log out
            </button>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>YOUR PERSONAL READING LIST</p>
            <h1>
              Keep your next reads
              <br />
              <span>close at hand.</span>
            </h1>
            <p className={styles.heroDescription}>
              Keep titles, notes, and links to the books you want to read next.
            </p>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <div className={styles.sun} />
            <div className={styles.artBookOne} />
            <div className={styles.artBookTwo} />
            <div className={styles.artBookThree} />
            <div className={styles.artShelf} />
            <span className={styles.artStar}>✳</span>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.formPanel}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>
                  {editingId ? "UPDATE YOUR LIST" : "ADD TO YOUR LIST"}
                </p>
                <h2>{editingId ? "Edit a read" : "Save a good read"}</h2>
              </div>
              <span className={styles.formIcon} aria-hidden="true">
                {editingId ? "✎" : "+"}
              </span>
            </div>

            <form className={styles.form} onSubmit={submitReadingItem}>
              <label className={styles.field}>
                <span>Title</span>
                <input
                  autoComplete="off"
                  maxLength={150}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. The Secret Garden"
                  required
                  value={name}
                />
              </label>

              <label className={styles.field}>
                <span>Notes or description</span>
                <textarea
                  maxLength={3000}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What is it about? Why do you want to read it?"
                  required
                  rows={3}
                  value={description}
                />
              </label>

              <label className={styles.field}>
                <span>Reading link</span>
                <input
                  autoComplete="url"
                  maxLength={2048}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://example.com/book"
                  required
                  type="url"
                  value={url}
                />
                <small className={styles.fieldHint}>
                  Paste a link to the book, article, or reading material.
                </small>
              </label>

              {error && (
                <p className={styles.messageError} role="alert">
                  {error}
                </p>
              )}
              {notice && (
                <p className={styles.messageSuccess} role="status">
                  {notice}
                </p>
              )}

              <div className={styles.formActions}>
                <button
                  className={styles.submitButton}
                  disabled={saving}
                  type="submit"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Add to reading list"}
                  {!saving && <span aria-hidden="true">→</span>}
                </button>
                {editingId && (
                  <button
                    className={styles.cancelButton}
                    onClick={resetForm}
                    type="button"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className={styles.booksSection}>
            <div className={styles.booksHeading}>
              <div>
                <p className={styles.eyebrow}>YOUR SAVED READS</p>
                <h2>Reading list</h2>
              </div>
              <span className={styles.count}>
                {books.length} {books.length === 1 ? "item" : "items"}
              </span>
            </div>

            {loading ? (
              <div className={styles.emptyState}>Loading your reading list...</div>
            ) : books.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon} aria-hidden="true">
                  ✳
                </span>
                <h3>Your list is waiting</h3>
                <p>Add a title above and it will show up here.</p>
              </div>
            ) : (
              <div className={styles.bookGrid}>
                {books.map((book) => (
                  <article className={styles.bookCard} key={book.id}>
                    <Link
                      aria-label={`View ${book.name} details`}
                      className={styles.bookLink}
                      href={`/books/${book.id}`}
                    >
                      <span className={styles.itemIcon} aria-hidden="true">
                        ↗
                      </span>
                      <div className={styles.bookDetails}>
                        <h3>{book.name}</h3>
                        <p>{book.description}</p>
                      </div>
                    </Link>
                    {book.url ? (
                      <a
                        className={styles.resourceLink}
                        href={book.url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Open reading link <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      <p className={styles.missingResource}>
                        Edit to add a reading link
                      </p>
                    )}
                    <div className={styles.cardActions}>
                      <button
                        className={styles.editButton}
                        onClick={() => startEditing(book)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => deleteBook(book)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className={styles.footer}>
          A little space for what you want to read next{" "}
          <span aria-hidden="true">✳</span>
        </footer>
      </div>
    </main>
  );
}
