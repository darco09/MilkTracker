import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "LittleCare",
  description: "Pencatat feeding NGT untuk anak dengan Cerebral Palsy",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2f8a76",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <div className="mx-auto flex min-h-screen max-w-md flex-col">
          <main className="flex-1 px-4 pb-28 pt-6">{children}</main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
