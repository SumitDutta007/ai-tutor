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
  title: "Tutorly - Your Personal AI Tutor",
  description: "Experience personalized learning with Tutorly, an advanced AI tutor that adapts to your learning style. Get instant feedback, interactive lessons, and comprehensive assessments.",
  keywords: "AI tutor, personalized learning, online education, artificial intelligence education, adaptive learning, virtual classroom",
  authors: [{ name: "Tutorly Team" }],
  creator: "Tutorly",
  publisher: "Tutorly",
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://ai-tutor-gamma-taupe.vercel.app/" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <CustomCursor />
        {children}
        <Toaster/>
      </body>
    </html>
  );
}
