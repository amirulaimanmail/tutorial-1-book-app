import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth";
import LoginForm from "./login/login-form";
import ReadingList from "./reading-list";

function LoadingReadingList() {
  return (
    <main>
      <p>Loading your reading list...</p>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingReadingList />}>
      <AuthenticatedHomePage />
    </Suspense>
  );
}

async function AuthenticatedHomePage() {
  const username = await getSessionUser();

  if (!username) {
    return <LoginForm redirectTo="/" />;
  }

  return <ReadingList username={username} />;
}
