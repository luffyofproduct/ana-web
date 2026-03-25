import type { Metadata } from "next";
import { Manrope, Inter, Tajawal } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ana: Arabic Language Learning App for Heritage Speakers",
  description:
    "Ana helps heritage speakers go from understanding Arabic to fully expressing themselves — through content they love, vocabulary that sticks.",
  openGraph: {
    title: "Ana: Arabic Language Learning App for Heritage Speakers",
    description:
      "Finally speak the Arabic you've always understood. Join the waitlist.",
    url: "https://getanaapp.com",
    siteName: "Ana",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
<body className={`${manrope.variable} ${inter.variable} ${tajawal.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
