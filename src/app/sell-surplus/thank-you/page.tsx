import ThankYouPage, { thankYouMetadata } from "@/components/request/ThankYouPage";

export const metadata = thankYouMetadata("surplus");

export default function Page() {
  return <ThankYouPage kind="surplus" />;
}
