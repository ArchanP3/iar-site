import ThankYouPage, { thankYouMetadata } from "@/components/request/ThankYouPage";

export const metadata = thankYouMetadata("repair");

export default function Page() {
  return <ThankYouPage kind="repair" />;
}
