import type React from "react"
import type { Metadata } from "next"
import { CartProvider } from "@/components/shop/cart-provider"

export const metadata: Metadata = {
  title: "Medicine Shop",
  description:
    "Browse and purchase affordable medicines while supporting our donation network. Every purchase helps fund our mission.",
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CartProvider>{children}</CartProvider>
}
