import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import { Providers } from "./providers";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nepal-election-live.vercel.app";
const SITE_NAME = "Nepal Election Live 2082";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nepal Election Results 2082 LIVE - Instant Updates from ECN | NepalElectionLive",
    template: "%s | Nepal Election 2082 Live Results",
  },
  description:
    "Live 2082 HoR election results from all 165 constituencies. Updated every 30 seconds directly from Election Commission Nepal data. Province leaders, vote margins, party tallies. नेपाल चुनाव नतिजा २०८२ लाइभ।",
  keywords: [
    "Nepal election results live",
    "election result 2082 live",
    "नेपाल चुनाव नतिजा",
    "Nepal election 2082",
    "election result Nepal",
    "HoR election results",
    "Nepali Congress",
    "CPN UML",
    "Bagmati election results",
    "Kathmandu election results",
    "Election Commission Nepal",
    "ECN results",
    "चुनाव नतिजा २०८२",
    "प्रतिनिधिसभा निर्वाचन",
    "live vote count Nepal",
  ],
  authors: [{ name: "NepalElectionLive", url: SITE_URL }],
  creator: "NepalElectionLive",
  publisher: "NepalElectionLive",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ne_NP",
    alternateLocale: ["en_US"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Nepal Election Results 2082 LIVE – Vote Counting Now",
    description:
      "Live constituency results from all 165 seats. Leading parties, vote margins, turnout. Updated every 30 seconds. नेपाल प्रतिनिधिसभा चुनाव नतिजा २०८२ लाइभ।",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Nepal Election 2082 Live Results Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@NepalElectionLive",
    creator: "@NepalElectionLive",
    title: "Nepal Election 2082 LIVE Results",
    description: "Live results from all 165 constituencies. Updated every 30s.",
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-US": `${SITE_URL}/en`,
      "ne-NP": `${SITE_URL}/ne`,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
  },
  category: "politics",
  classification: "Election Results",
  other: {
    "geo.region": "NP",
    "geo.placename": "Nepal",
    "DC.language": "ne",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

// Schema.org structured data for rich results
const electionSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Nepal House of Representatives Election 2082 Results",
  description:
    "Live election results for Nepal's 2082 BS House of Representatives election across all 165 constituencies in 7 provinces.",
  url: SITE_URL,
  temporalCoverage: "2082/2082",
  spatial: "Nepal",
  publisher: {
    "@type": "Organization",
    name: "NepalElectionLive",
    url: SITE_URL,
  },
  distribution: {
    "@type": "DataDownload",
    encodingFormat: "application/json",
    contentUrl: `${SITE_URL}/api/scrape`,
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Nepal Election 2082 Live Results",
      item: `${SITE_URL}/results`,
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ne" className={`${inter.variable} ${devanagari.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(electionSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://election.gov.np" />
        <link rel="dns-prefetch" href="https://election.gov.np" />
        {/* Google Adsense placeholder */}
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
