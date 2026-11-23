import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { SetupForm } from "@/components/admin/AuthForms";
import { dbProblem, one } from "@/lib/cms/db";

export default function Page() {
  return (
    <Suspense>
      <Setup />
    </Suspense>
  );
}

async function Setup() {
  await connection();
  if (await dbProblem()) redirect("/admin/login");
  const n = await one<{ n: number }>(`SELECT count(*)::int AS n FROM cms.cms_users`);
  if (n?.n) redirect("/admin/login");
  return <SetupForm />;
}
