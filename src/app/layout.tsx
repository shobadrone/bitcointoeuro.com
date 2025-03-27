import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bebas-neue",
});

export const metadata: Metadata = {
  title: "Bitcoin to Euro Conversion | Real-time BTC/EUR Price | bitcointoeuro.com",
  description: "Bitcoin to Euro information with calculator, historic data and real-time exchange rates. Get accurate BTC to EUR exchange information and exchange options.",
  keywords: ["bitcoin", "euro", "btc to eur", "bitcoin price", "cryptocurrency conversion", "btc/eur exchange rate", "bitcoin calculator", "bitcoin euro converter", "btc eur chart", "bitcoin exchange rates", "bitcoin price history", "best bitcoin exchange rate", "live bitcoin euro price"],
  authors: [{ name: "bitcointoeuro.com" }],
  creator: "bitcointoeuro.com",
  publisher: "bitcointoeuro.com",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://bitcointoeuro.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bitcoin to Euro Conversion | Real-time BTC/EUR Price",
    description: "Bitcoin to Euro information with calculator, historic data and real-time exchange rates. Get accurate BTC to EUR exchange information and exchange options.",
    url: "https://bitcointoeuro.com",
    siteName: "bitcointoeuro.com",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bitcoin to Euro Conversion | Real-time BTC/EUR Price",
    description: "Bitcoin to Euro information with calculator, historic data and real-time exchange rates. Get accurate BTC to EUR exchange information and exchange options.",
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`}>
      <head>
        <meta name="impact-site-verification" value="3121b2bd-18bb-4fae-872e-999006b50099" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="dns-prefetch" href="//api.coingecko.com" />
        <link rel="dns-prefetch" href="//api.livecoinwatch.com" />
        <link rel="preconnect" href="//api.coingecko.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="//api.livecoinwatch.com" crossOrigin="anonymous" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Bitcoin to Euro calculator, charts, exchange rates",
              "url": "https://bitcointoeuro.com",
              "description": "Bitcoin to Euro information with calculator, historic data and real-time exchange rates. Get accurate BTC to EUR exchange information and exchange options.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://bitcointoeuro.com/?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          `}
        </script>
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://bitcointoeuro.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Bitcoin Price Chart",
                  "item": "https://bitcointoeuro.com/#price-chart"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Bitcoin Calculator",
                  "item": "https://bitcointoeuro.com/#calculator"
                }
              ]
            }
          `}
        </script>
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "FinancialProduct",
              "name": "Bitcoin to Euro Exchange Rate",
              "description": "Current and historical Bitcoin to Euro (BTC/EUR) exchange rates with calculator and price charts",
              "url": "https://bitcointoeuro.com",
              "category": "Currency Conversion Tool",
              "feesAndCommissionsSpecification": "Compare fees across different exchanges",
              "brand": {
                "@type": "Brand",
                "name": "bitcointoeuro.com"
              }
            }
          `}
        </script>
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Dataset",
              "name": "Bitcoin to Euro Price History",
              "description": "Historical price data for Bitcoin (BTC) to Euro (EUR) conversion rates",
              "keywords": ["bitcoin price", "cryptocurrency price", "btc to eur", "historical price data", "crypto chart"],
              "url": "https://bitcointoeuro.com/#price-chart",
              "variableMeasured": "Exchange Rate",
              "datasetTimeInterval": "P365D",
              "creator": {
                "@type": "Organization",
                "name": "bitcointoeuro.com"
              },
              "distribution": {
                "@type": "DataDownload",
                "contentUrl": "https://bitcointoeuro.com/#price-chart",
                "encodingFormat": "text/html"
              },
              "temporalCoverage": "2023/2025"
            }
          `}
        </script>
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [{
                "@type": "Question",
                "name": "What is the current Bitcoin to Euro exchange rate?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The current Bitcoin to Euro exchange rate is updated in real-time on bitcointoeuro.com. Visit our site for the latest BTC/EUR price from multiple exchanges."
                }
              }, {
                "@type": "Question",
                "name": "How can I convert Bitcoin to Euro?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can convert Bitcoin to Euro using our calculator tool at bitcointoeuro.com. Simply enter the amount of Bitcoin you want to convert, and the calculator will show you the equivalent amount in Euros based on the current exchange rate."
                }
              }, {
                "@type": "Question",
                "name": "Where can I find historical Bitcoin to Euro price charts?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can find historical Bitcoin to Euro price charts on bitcointoeuro.com. Our site offers interactive price charts with multiple timeframes to track BTC/EUR price movements over time."
                }
              }]
            }
          `}
        </script>
      </head>
      <body style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        padding: 0,
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        overflowX: 'hidden',
        position: 'relative'
      }}>
        <Header />
        <main style={{ 
          flex: '1 1 auto',
          backgroundColor: 'var(--background)',
          position: 'relative'
        }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
