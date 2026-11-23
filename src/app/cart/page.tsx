import ShopShell from "@/components/cart/ShopShell";
import CartView from "@/components/cart/CartView";
import { PageExtras, seo } from "@/lib/cms/seo";

export const generateMetadata = seo("/cart", {
  title: "Your Cart | IAR",
  robots: { index: false, follow: true },
});

export default function CartPage() {
  return (
    <ShopShell crumb="Cart" title="Your" accent="Cart" text="In-stock parts, priced in USD. We confirm stock, shipping and your invoice before you pay.">
      <PageExtras path="/cart" />
      <CartView />
    </ShopShell>
  );
}
