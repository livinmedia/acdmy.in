import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "ACDMY — Learn AI. Every Day. For Real.",
  description:
    "A new hands-on AI course drops every single day. Video lessons, interactive exercises, AI mentor, and a community of builders. $25/mo.",
  openGraph: {
    type: "website",
    url: "https://www.acdmy.in/",
    title: "ACDMY — Learn AI. Every Day. For Real.",
    description:
      "A new hands-on AI course drops every single day. Video lessons, interactive exercises, AI mentor, and a community of builders. $25/mo.",
    images: [
      {
        url: "https://www.acdmy.in/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ACDMY — Learn AI. Every Day. For Real.",
    description:
      "A new hands-on AI course drops every single day. Video lessons, interactive exercises, AI mentor, and a community of builders. $25/mo.",
    images: ["https://www.acdmy.in/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
