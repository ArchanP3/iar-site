import ThankYouPage, { thankYouMetadata } from "@/components/request/ThankYouPage";

export const metadata = thankYouMetadata("quote");

export default function Page() {
  return <ThankYouPage kind="quote" />;
}
