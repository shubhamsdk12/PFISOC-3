import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { Geist_Mono } from "next/font/google"
import { Space_Grotesk, Inter } from "next/font/google"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })
const _geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "ESG Credibility Monitor",
  description: "AI-powered verification of sustainability claims in real time",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} font-sans antialiased bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#0b132b] text-foreground`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
