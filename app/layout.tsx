import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter,Plus_Jakarta_Sans, Nunito, Poppins, Montserrat, Playfair_Display } from "next/font/google";
import NextTopLoader from 'nextjs-toploader';

import "./globals.css";
import ReactQueryProvider from "@/lib/reactQuery";
import { AuthProvider } from "@/context/authentication";
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

export const metadata: Metadata = {
  title: "Prepmaster",
  description: "A comprehensive platform for students to prepare for their exams with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jarkataSans.variable} ${inter.variable} ${geistSans.variable} ${geistMono.variable} ${inter.variable} ${nunito.variable} ${poppins.variable} ${montserrat.variable} ${playfair.variable} antialiased`}
      >
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
            <ProtectedRouteGuard>
              {/* <RouteChangeLoader /> */}
              <Suspense fallback={<PageLoader/>}>
        {children}
         </Suspense>
            </ProtectedRouteGuard>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
