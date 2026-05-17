import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store | Apex Executive Advisory",
  description: "Browse sessions and resources. Add to cart and pay securely at checkout.",
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
