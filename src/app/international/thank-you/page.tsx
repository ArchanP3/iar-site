import ThankYouPage, { thankYouMetadata } from "@/components/request/ThankYouPage";

export const metadata = thankYouMetadata("international");

export default function Page() {
  return <ThankYouPage kind="international" />;
}
