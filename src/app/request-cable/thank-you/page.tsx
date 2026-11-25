import ThankYouPage, { thankYouMetadata } from "@/components/request/ThankYouPage";

export const metadata = thankYouMetadata("cable");

export default function Page() {
  return <ThankYouPage kind="cable" />;
}
