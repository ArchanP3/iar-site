import ThankYouPage, { thankYouMetadata } from "@/components/request/ThankYouPage";

export const metadata = thankYouMetadata("pickup");

export default function Page() {
  return <ThankYouPage kind="pickup" />;
}
