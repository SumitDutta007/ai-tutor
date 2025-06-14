import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import CustomCursor from '../components/CustomCursor';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TutorlyAI - Your Personal AI Tutor",
  description: "Experience personalized learning with TutorlyAI, an advanced AI tutor that adapts to your learning style. Get instant feedback, interactive lessons, and comprehensive assessments.",
  keywords: "AI tutor, personalized learning, online education, artificial intelligence education, adaptive learning, virtual classroom",
  authors: [{ name: "TutorlyAI Team" }],
  creator: "TutorlyAI",
  publisher: "TutorlyAI",
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://ai-tutor-gamma-taupe.vercel.app/" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CustomCursor />
        {children}
        <Toaster/>
      </body>
    </html>
  );
}
