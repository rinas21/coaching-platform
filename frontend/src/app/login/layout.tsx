import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | Apex Executive Advisory",
  description: "Sign in or create an account to manage your profile, purchases, and meetings.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
