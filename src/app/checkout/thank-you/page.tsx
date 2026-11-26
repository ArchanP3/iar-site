import ThankYouPage, { thankYouMetadata } from "@/components/request/ThankYouPage";
import PlacedOrder from "@/components/cart/PlacedOrder";

export const metadata = thankYouMetadata("order");

export default function Page() {
  return (
    <ThankYouPage kind="order">
      <PlacedOrder />
    </ThankYouPage>
  );
}
