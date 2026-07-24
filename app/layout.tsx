import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import GlobalErrorSuppressor from "@/components/common/GlobalErrorSuppressor";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const kantumruy = localFont({
  src: [
    {
      path: "../../public/fonts/Kantumruy-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Kantumruy-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Kantumruy-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-kantumruy",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tv360.metfone.com.kh"),
  title: {
    template: "%s | TV360 - Watch TV online",
    default: "TV360 - Watch TV online, special HD movie store",
  },
  description:
    "TV360 - Watch live TV, special HD movie store. New movies and Video are updated everyday. Watch online TV shows, sports, videos anytime, anywhere.",
  keywords: [
    "TV360",
    "watch online TV",
    "K+ channels",
    "special HD movie store",
  ],
  openGraph: {
    title: "TV360 - Watch TV online, special HD movie store",
    description:
      "TV360 - Watch live TV, special HD movie store. New movies and Video are updated everyday. Watch online TV shows, sports, videos anytime, anywhere.",
    url: "https://tv360.metfone.com.kh/",
    siteName: "tv360.metfone.com.kh",
    images: [
      {
        url: "https://img-evg4.tv360.metfone.com.kh/vtc-image/og-image/og-image-20250227.jpg",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "TV360 - Watch TV online, special HD movie store",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`overflow-x-hidden ${inter.variable} ${kantumruy.variable}`}
    >
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-V75SMXEX4T"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', 'G-V75SMXEX4T');
        `}
        </Script>
      </head>
      <body
        className="font-sans bg-tv-dark text-white overflow-x-hidden antialiased"
        suppressHydrationWarning
      >
        <div className="relative w-full min-h-screen bg-tv-dark">
          <GlobalErrorSuppressor />
          {children}
        </div>
      </body>
    </html>
  );
}
