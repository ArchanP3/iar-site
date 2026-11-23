import ShopShell from "@/components/cart/ShopShell";
import CheckoutForm from "@/components/cart/CheckoutForm";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/checkout", {
  title: "Checkout | IAR",
  robots: { index: false, follow: false },
});

export default function CheckoutPage() {
  return (
    <ShopShell crumb="Checkout" title="Secure" accent="Checkout" text="Tell us where to ship. We confirm stock, shipping and your invoice by email before you pay." secure>
      <PageExtras path="/checkout" />
      <CheckoutForm />
    </ShopShell>
  );
}
