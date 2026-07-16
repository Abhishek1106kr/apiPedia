import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "apiPedia — Developer Intelligence Platform for APIs",
  description: "Developer-first intelligence platform for API discovery, performance benchmarks, DNA comparisons, playgrounds, and integration paths.",
};

export default function RootLayout({ children }) {
  return (
    <html  
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ backgroundColor: "#0B0D10" }}
    >
      <body className="min-h-full flex flex-col bg-[#0B0D10] text-zinc-100 selection:bg-zinc-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
