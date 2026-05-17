import Footer from "@/components/Footer";
import Navbar from "@/components/Header";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import Preloader from "@/components/Preloader";
import CustomCursor from "@/components/CustomCursor";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import "./globals.css";

export const metadata = {
  title: "Apex Executive Advisory | Executive Coaching & Business Advisory",
  description:
    "A premier executive coaching and business strategy advisory firm based in Sri Lanka, working with C-suite leaders, founders, and global enterprises.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="font-nunito bg-cream-brand text-brown-brand min-h-screen flex flex-col overflow-x-hidden w-full"
        suppressHydrationWarning
      >
        <CustomCursor />
        <Preloader />
        <SmoothScrollProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SmoothScrollProvider>
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
