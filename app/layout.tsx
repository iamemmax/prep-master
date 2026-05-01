import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter,Plus_Jakarta_Sans, Nunito, Poppins, Montserrat, Playfair_Display } from "next/font/google";
import NextTopLoader from 'nextjs-toploader';

import "./globals.css";
import ReactQueryProvider from "@/lib/reactQuery";
import { AuthProvider } from "@/context/authentication";
import { ThemeProvider, themeInitScript } from "@/context/theme";
import ProtectedRouteGuard from "@/lib/ProtectedRouteGuard";
import { Suspense } from "react";
import PageLoader from "@/lib/PageLoader";
import { Toaster } from "react-hot-toast";

const jarkataSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const SITE_NAME = "PrepMaster";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prepmaster.app";
const SITE_DESCRIPTION =
  "PrepMaster helps students prepare for WAEC, JAMB, NECO, SAT, IELTS, TOEFL and more with AI-powered practice questions, mock exams, smart analytics, and an adaptive study coach.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — AI-powered exam prep`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "exam preparation",
    "AI study coach",
    "WAEC",
    "JAMB",
    "NECO",
    "SAT",
    "IELTS",
    "TOEFL",
    "CPA",
    "PMP",
    "practice questions",
    "mock exams",
    "study planner",
    "PrepMaster",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — AI-powered exam prep`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — AI-powered exam prep`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — AI-powered exam prep`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${jarkataSans.variable} ${inter.variable} ${geistSans.variable} ${geistMono.variable} ${inter.variable} ${nunito.variable} ${poppins.variable} ${montserrat.variable} ${playfair.variable} antialiased`}
      >
        {/* JSON-LD: tells Google this is an educational platform with a search box. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "EducationalOrganization",
                name: SITE_NAME,
                url: SITE_URL,
                description: SITE_DESCRIPTION,
                logo: `${SITE_URL}/favicon.ico`,
                sameAs: [],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE_NAME,
                url: SITE_URL,
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${SITE_URL}/?q={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        <NextTopLoader
          color="#f1d111"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #7C3AED,0 0 5px #7C3AED"
        />
         <Toaster
          containerStyle={{
            zIndex: 99999,
          }}
          position="top-center"
          toastOptions={{
            style: {
              zIndex: 999999,
            },
          }}
        />
           <ReactQueryProvider>
          <AuthProvider>
            <ThemeProvider>
              <ProtectedRouteGuard>
                {/* <RouteChangeLoader /> */}
                <Suspense fallback={<PageLoader/>}>
          {children}
           </Suspense>
              </ProtectedRouteGuard>
            </ThemeProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
