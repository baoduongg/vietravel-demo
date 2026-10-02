import type { Metadata, Viewport } from "next"
import { Mulish } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import { company } from "@/config/company"
import "./globals.css"

const mulish = Mulish({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: `${company.persona.name} · Trợ lý du lịch ${company.brand}`,
  description: `Trò chuyện bằng giọng nói với ${company.persona.name}, ${company.persona.role} ảo của ${company.brand}.`,
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="vi">
      <body className={`${mulish.variable}`}>
        {children}
        <Toaster position="top-center" richColors={false} />
      </body>
    </html>
  )
}
