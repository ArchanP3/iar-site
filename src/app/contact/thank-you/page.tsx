import ThankYouPage, { thankYouMetadata } from "@/components/request/ThankYouPage";

export const metadata = thankYouMetadata("contact");

export default function Page() {
  return <ThankYouPage kind="contact" />;
}
