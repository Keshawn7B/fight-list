import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://fight-list.kfuture.chatgpt.site"
).replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  title: "Fight List — Upcoming Combat Sports",
  description:
    "Upcoming MMA, boxing, Muay Thai, and bare-knuckle events with local start times and official watch links.",
  openGraph: {
    title: "Fight List — Fight night. No excuses.",
    description:
      "Upcoming combat sports, local start times, and the official place to watch.",
    type: "website",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/og.png`,
        width: 1536,
        height: 1024,
        alt: "Fight List combat sports schedule",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fight List — Fight night. No excuses.",
    description:
      "Upcoming combat sports, local start times, and the official place to watch.",
    images: [`${siteUrl}/og.png`],
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
