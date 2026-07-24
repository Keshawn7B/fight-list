import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;

  return {
    metadataBase: new URL(baseUrl),
    title: "Fight List — Upcoming Combat Sports",
    description:
      "Upcoming MMA, boxing, Muay Thai, and bare-knuckle events with local start times and official watch links.",
    openGraph: {
      title: "Fight List — Never miss the bell",
      description:
        "Upcoming combat sports, local start times, and the official place to watch.",
      type: "website",
      url: baseUrl,
      images: [
        {
          url: `${baseUrl}/og.png`,
          width: 1536,
          height: 1024,
          alt: "Fight List combat sports schedule",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Fight List — Never miss the bell",
      description:
        "Upcoming combat sports, local start times, and the official place to watch.",
      images: [`${baseUrl}/og.png`],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#12130f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
