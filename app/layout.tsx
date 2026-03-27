import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "FamilyCookbook",
  description: "A private, collaborative family cookbook with recipe lineage, stories, and rich media."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
