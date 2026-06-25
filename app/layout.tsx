import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Baisa OS — Business Operating System for MSMEs",
    template: "%s · Baisa OS"
  },
  description:
    "Baisa OS is a full-stack Business Operating System for MSME manufacturers and D2C brands — catalog & costing, manufacturing registers, inventory, orders, finance/MIS and an intelligence layer that tells you what to do today.",
  metadataBase: new URL("https://baisajaipur.in"),
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23c9a24b'/><text x='50' y='72' font-size='62' text-anchor='middle' fill='%2314141c' font-family='serif' font-weight='bold'>B</text></svg>"
  },
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
