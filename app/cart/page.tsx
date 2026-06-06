import type { Metadata } from "next";
import { CartPage } from "../../components/cart-page";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your Signature Swings cart and continue to secure checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ShoppingCartPage() {
  return (
    <main className="cart-page">
      <CartPage />
    </main>
  );
}
