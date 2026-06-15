import type { Metadata } from "next";
import { CartPage } from "../../components/cart-page";
import { CompleteGolfSetup } from "../../components/complete-golf-setup";
import { getAllProducts } from "../../lib/catalog";
import { fetchShopifyProductsByCollectionHandle } from "../../lib/shopify";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your Signature Swings cart and continue to secure checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ShoppingCartPage() {
  const bestSellerProducts =
    await fetchShopifyProductsByCollectionHandle("best-sellers");

  return (
    <main className="cart-page">
      <CartPage />
      <CompleteGolfSetup products={(bestSellerProducts ?? getAllProducts()).slice(0, 3)} />
    </main>
  );
}
