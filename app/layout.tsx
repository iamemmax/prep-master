import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";

const jarkataSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
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
        className={`${jarkataSans.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
