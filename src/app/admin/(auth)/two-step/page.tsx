import { Suspense } from "react";
import { redirect } from "next/navigation";
import { TwoStepForm } from "@/components/admin/AuthForms";
import { pendingTwoFactorUser } from "@/lib/cms/auth";

export default function Page({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  return (
    <Suspense>
      <TwoStep searchParams={searchParams} />
    </Suspense>
  );
}

async function TwoStep({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  if (!(await pendingTwoFactorUser())) redirect("/admin/login");
  return <TwoStepForm remember={(await searchParams).r === "1"} />;
}
