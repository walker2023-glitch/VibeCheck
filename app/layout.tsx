import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeCheck",
  description: "Application foundation"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
