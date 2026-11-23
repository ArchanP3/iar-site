import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { LoginForm } from "@/components/admin/AuthForms";
import { dbProblem, one } from "@/lib/cms/db";
import { currentUser } from "@/lib/cms/auth";

export default function Page() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}

async function Login() {
  await connection();
  const problem = await dbProblem();
  const on = !problem;
  if (on) {
    if (await currentUser()) redirect("/admin");
    const n = await one<{ n: number }>(`SELECT count(*)::int AS n FROM cms.cms_users`);
    if (!n?.n) redirect("/admin/setup");
  }
  return <LoginForm enabled={on} problem={problem} />;
}
