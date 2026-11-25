import ThankYouPage, { thankYouMetadata } from "@/components/request/ThankYouPage";

export const metadata = thankYouMetadata("onsite");

export default function Page() {
  return <ThankYouPage kind="onsite" />;
}
