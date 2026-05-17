import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Apex Executive Advisory",
  description: "Review your order and complete payment securely.",
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
